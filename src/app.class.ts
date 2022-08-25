import { Config } from './config.class';

export class App {
  config: Config = new Config();

  static async startApp(): Promise<App> {
    const app = new App();
    await app.config.readConfigFile();
    console.log(app.config.params);
    return app;
  }
}
