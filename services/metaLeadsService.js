// services/metaLeadsService.js
const axios = require('axios');

/**
 * Get Page Access Token from User Access Token
 * @param {string} userAccessToken - User access token
 * @param {string} pageId - Facebook page ID
 * @returns {Promise<string>} Page access token
 */
async function getPageAccessToken(userAccessToken, pageId) {
  try {
    const response = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
      params: {
        access_token: userAccessToken
      }
    });

    const pages = response.data.data || [];
    const page = pages.find(p => p.id === pageId || p.id === pageId.replace('act_', ''));
    
    if (page && page.access_token) {
      return page.access_token;
    }
    
    // If not found, return the original token (might already be a page token)
    return userAccessToken;
  } catch (error) {
    console.warn('Could not get page token, using provided token:', error.message);
    return userAccessToken;
  }
}

/**
 * Fetch leads from Meta (Facebook Lead Ads)
 * @param {string} accessToken - Meta access token (User or Page token)
 * @param {string} pageId - Facebook page ID
 * @param {string} formId - Lead form ID (optional)
 * @param {Date} since - Fetch leads since this date
 * @returns {Promise<Array>} Array of leads
 */
async function fetchMetaLeads(accessToken, pageId, formId = null, since = null) {
  try {
    // Try to get page access token if user token provided
    const pageAccessToken = await getPageAccessToken(accessToken, pageId);
    
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
        access_token: pageAccessToken,
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
        const formLeads = await fetchMetaLeads(pageAccessToken, pageId, form.id, since);
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
  parseMetaLead,
  getPageAccessToken
};
