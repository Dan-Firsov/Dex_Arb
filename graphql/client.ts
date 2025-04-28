import pLimit from 'p-limit';

const limit = pLimit(20);

export async function graphqlRequest<T>(
  endpoint: string,
  query: string,
  variables: Record<string, any>,
): Promise<T | null> {
  try {
    return await limit(async () => {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables }),
      });
      const json = await res.json();
      if (json.errors) {
        console.error(`❌ GraphQL errors from ${endpoint}:`, json.errors);
        throw new Error(JSON.stringify(json.errors));
      }
      return json.data as T;
    });
  } catch (error) {
    console.error(`❌ Error on ${endpoint}:`, error);
    return null;
  }
}
