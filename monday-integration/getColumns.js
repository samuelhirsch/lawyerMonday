import { ApiClient } from "@mondaydotcomorg/api";


export default async function getColumns(itemId) {
  const client = new ApiClient({
    token: process.env.MONDAY_API_TOKEN,
  });
 
  const query = `
      query ($itemId: [ID!]) {
        items(ids: $itemId) {
          name
          column_values {
            id
            text
            column {
            title
           }
          }
        }
      }
    `;

  const variables = {
    itemId: [itemId]
  };

  const response = await client.request(query, variables);

  const item = response.items?.[0] || response.data?.items?.[0];
  if (!item) {
    throw new Error(`Monday item not found for itemId ${itemId ?? "unknown"}`);
  }
  if (!Array.isArray(item.column_values)) {
    throw new Error(`Monday item ${itemId ?? "unknown"} returned invalid column data`);
  }
  const cleanData = {
    name: item.name,
  };

  item.column_values.forEach(col => {
    if (!col?.column?.title) {
      return;
    }
    const cleanKey = col.column.title.toLowerCase();
    cleanData[cleanKey] = col.text ?? "";
  });

  console.log("Loaded Monday item data", {
    name: cleanData.name,
    hasEmail: Boolean(cleanData.email),
    fieldCount: Object.keys(cleanData).length,
  });
  return cleanData;
}
