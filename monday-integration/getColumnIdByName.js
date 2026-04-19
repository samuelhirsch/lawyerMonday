import logError from "./logError.js";
import { ApiClient } from "@mondaydotcomorg/api";
export default async function getColumnIdByName(boardId,columnName) {
    const client = new ApiClient({
        token: process.env.MONDAY_API_TOKEN,
    });

    const query = `
        query ($boardId: ID!) {
            boards(ids: [$boardId]) {
                columns {
                    id
                    title
                }
            }
        }
    `;

    const res = await client.request(query, { boardId });

    const columns = res.boards?.[0]?.columns || [];

    const column = columns.find(
        (col) =>
            col.title.toLowerCase() === columnName.toLowerCase()
    );

    if (!column) {
        logError(new Error(`cant finnd the coulmn name ${columnName}`),"by trying to get the coulmn id from the name")
        return null;
    }
    return column.id;
}