import { createApp } from './app';



const DEFAULT_PORT = 4000;
const port = Number(process.env.PORT ?? DEFAULT_PORT);


createApp().listen(port, () => {
  console.log(`T-Pay backend listening on port ${port}`);
});