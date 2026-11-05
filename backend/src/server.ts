import 'dotenv/config';
import { createApp } from './app';
import { createDependencies } from './composition/createDependencies';



const DEFAULT_PORT = 4000;
const port = Number(process.env.PORT ?? DEFAULT_PORT);



createApp(createDependencies(process.env)).listen(port, () => {
  console.log(`T-Pay backend listening on port ${port}`);
});