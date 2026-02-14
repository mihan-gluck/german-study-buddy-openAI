// services/mondayService.js
const axios = require('axios');

/**
 * Add a lead to Monday.com board
 * @param {string} apiToken - Monday.com API token
 * @param {string} boardId - Monday.com board ID
 * @param {Object} leadData - Lead data to add
 * @returns {Promise<Object>} Created item response
 */
async function addLeadToMonday(apiToken, boardId, leadData) {
  try {
    const mutation = `
      mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
        create_item (
          board_id: $boardId,
          item_name: $itemName,
          column_values: $columnValues
        ) {
          id
          name
        }
      }
    `;

    // Prepare column values based on your Monday.com board structure
    // Map Meta lead fields to Monday columns
    const columnValues = {
      // Basic contact info
      text_mkw3spks: leadData.email || '',           // Email column
      text_mkw2wpvr: leadData.phone || '',           // Phone Number column
      phone_mkv0a5mm: leadData.phone || '',          // WhatsApp Number column
      
      // Meta lead tracking
      text_mkw0n3t5: leadData.metaLeadId || '',      // META LEAD ID column (actual lead ID)
      text_mkvwk3h9: leadData.formId || '',          // ad_id column (using Form ID - best available)
      date_mkw2jae2: leadData.createdTime ? new Date(leadData.createdTime).toISOString().split('T')[0] : new Date().toISOString().split('T')[0], // Date column
      text_mkvdkw8g: 'Facebook Lead Ad',             // Lead Source column
      text_mkvwwp5t: leadData.formName || 'Unknown Form',  // ad_name column (Form Name)
      
      // Additional fields from Meta form
      text_mkw38wse: leadData.customFields['how_old_are_you?'] || '',  // Age column
      text_mkw32n6r: leadData.customFields['may_we_know_your_highest_level_of_education?'] || '',  // Qualification column
      text_mkv080k2: leadData.customFields['your_degree/diploma_field'] || '',  // Client Address (using for field of study)
      
      // Comment from Meta - Note: Meta Lead Ads API does not provide platform, campaign, or ad set info
      text_mkv7nzpn: `Platform: Meta Lead Ad (FB/IG - not specified by API)\nForm ID: ${leadData.formId || 'N/A'}\nLead ID: ${leadData.metaLeadId || 'N/A'}\n\nNote: Meta API does not provide campaign name or ad set name for lead ads.\n\nForm Data:\n${JSON.stringify(leadData.customFields, null, 2)}`
    };

    const variables = {
      boardId: boardId,
      itemName: leadData.name || 'New Lead',
      columnValues: JSON.stringify(columnValues)
    };

    const response = await axios.post(
      'https://api.monday.com/v2',
      {
        query: mutation,
        variables: variables
      },
      {
        headers: {
          'Authorization': apiToken,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.errors) {
      console.error('Monday.com API errors:', response.data.errors);
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data.create_item;
  } catch (error) {
    console.error('Error adding lead to Monday:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Check if a lead already exists in Monday.com board
 * @param {string} apiToken - Monday.com API token
 * @param {string} boardId - Monday.com board ID
 * @param {string} email - Email to search for
 * @returns {Promise<boolean>} True if lead exists
 */
async function checkLeadExists(apiToken, boardId, email) {
  try {
    const query = `
      query ($boardId: ID!) {
        boards (ids: [$boardId]) {
          items_page {
            items {
              id
              name
              column_values {
                id
                text
              }
            }
          }
        }
      }
    `;

    const response = await axios.post(
      'https://api.monday.com/v2',
      {
        query: query,
        variables: { boardId: boardId }
      },
      {
        headers: {
          'Authorization': apiToken,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.errors) {
      console.error('Monday.com API errors:', response.data.errors);
      return false;
    }

    const items = response.data.data.boards[0]?.items_page?.items || [];
    
    // Check if any item has matching email
    return items.some(item => {
      const emailColumn = item.column_values.find(col => col.id === 'text_mkw3spks'); // Your Email column ID
      return emailColumn && emailColumn.text === email;
    });
  } catch (error) {
    console.error('Error checking lead existence:', error.response?.data || error.message);
    return false;
  }
}

module.exports = {
  addLeadToMonday,
  checkLeadExists
};
