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
  //let itemcolumnname=item.column_values[3].column.title;
  //console.log("this", itemcolumnname);
  const cleanData = {
    name: item.name,
  };

  item.column_values.forEach(col => {
    const cleanKey = col.column.title.toLowerCase()
    cleanData[cleanKey] = col.text;
  });

  console.log("CLEAN DATA:");
  console.log(cleanData);
  return cleanData;
}
