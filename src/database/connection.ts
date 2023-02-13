import client from "./config";

const startDatabase = async (): Promise<void> => {
  await client.connect();
};

export default startDatabase;
