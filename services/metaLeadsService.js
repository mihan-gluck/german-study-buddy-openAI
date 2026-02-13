// services/metaLeadsService.js
const axios = require('axios');

/**
 * Fetch leads from Meta (Facebook Lead Ads)
 * @param {string} accessToken - Meta access token
 * @param {string} pageId - Facebook page ID
 * @param {string} formId - Lead form ID (optional)
 * @param {Date} since - Fetch leads since this date
 * @returns {Promise<Array>} Array of leads
 */
async function fetchMetaLeads(accessToken, pageId, formId = null, since = null) {
  try {
    const sinceTimestamp = since ? Math.floor(since.getTime() / 1000) : Math.floor(Date.now() / 1000) - 86400; // Default: last 24 hours
    
    let url;
    if (formId) {
      // Fetch leads from specific form
      url = `https://graph.facebook.com/v18.0/${formId}/leads`;
    } else {
      // Fetch all leads from page
      url = `https://graph.facebook.com/v18.0/${pageId}/leadgen_forms`;
    }

    const response = await axios.get(url, {
      params: {
        access_token: accessToken,
        fields: 'id,created_time,field_data',
        filtering: JSON.stringify([{
          field: 'time_created',
          operator: 'GREATER_THAN',
          value: sinceTimestamp
        }])
      }
    });

    if (formId) {
      return response.data.data || [];
    } else {
      // If fetching all forms, get leads from each form
      const forms = response.data.data || [];
      const allLeads = [];
      
      for (const form of forms) {
        const formLeads = await fetchMetaLeads(accessToken, pageId, form.id, since);
        allLeads.push(...formLeads);
      }
      
      return allLeads;
    }
  } catch (error) {
    console.error('Error fetching Meta leads:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Parse Meta lead data into structured format
 * @param {Object} lead - Raw lead data from Meta
 * @returns {Object} Parsed lead data
 */
function parseMetaLead(lead) {
  const parsedData = {
    metaLeadId: lead.id,
    createdTime: lead.created_time,
    name: '',
    email: '',
    phone: '',
    customFields: {}
  };

  // Parse field_data array
  if (lead.field_data && Array.isArray(lead.field_data)) {
    lead.field_data.forEach(field => {
      const fieldName = field.name.toLowerCase();
      const fieldValue = field.values && field.values.length > 0 ? field.values[0] : '';

      // Map common fields
      if (fieldName.includes('name') || fieldName === 'full_name') {
        parsedData.name = fieldValue;
      } else if (fieldName.includes('email')) {
        parsedData.email = fieldValue;
      } else if (fieldName.includes('phone') || fieldName.includes('mobile')) {
        parsedData.phone = fieldValue;
      } else {
        // Store other fields as custom fields
        parsedData.customFields[field.name] = fieldValue;
      }
    });
  }

  return parsedData;
}

module.exports = {
  fetchMetaLeads,
  parseMetaLead
};
