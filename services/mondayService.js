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
    const columnValues = {
      email: leadData.email || '',
      phone: leadData.phone || '',
      text: leadData.metaLeadId || '',
      date4: leadData.createdTime ? new Date(leadData.createdTime).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    };

    // Add custom fields if they exist
    if (leadData.customFields) {
      Object.keys(leadData.customFields).forEach(key => {
        // Map custom fields to Monday columns as needed
        // You'll need to adjust these based on your actual Monday board structure
      });
    }

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
      const emailColumn = item.column_values.find(col => col.id === 'email');
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
