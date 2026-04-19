import { ApiClient } from "@mondaydotcomorg/api";
import logError from "./logError.js";

export default async function updateEmailStatus(boardId, itemId, columnId, labelText) {
  try {
    const client = new ApiClient({
      token: process.env.MONDAY_API_TOKEN,
    });

    const mutation = `
      mutation ($boardId: ID!, $itemId: ID!, $columnId: String!, $value: JSON!) {
        change_column_value(
          board_id: $boardId
          item_id: $itemId
          column_id: $columnId
          value: $value
        ) {
          id
        }
      }
    `;

    const variables = {
      boardId,
      itemId,
      columnId,
      value: JSON.stringify({ label: labelText })
    };

    await client.request(mutation, variables);
    return true;
  } catch (error) {
    logError(
      error,
      `Failed to update email status to "${labelText}" for item ${itemId} on board ${boardId}`
    );
    return false;
  }
}
