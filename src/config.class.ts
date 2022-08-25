import { ConfigParams } from './config.model';
import { readFile, writeFile } from 'fs/promises';

export class Config {
  static readonly FILE_NAME = 'config.json';

  params: ConfigParams = {
    environments: []
  };

  private hasConfigFileBeenRead = false;

  async readConfigFile() {
    if (this.hasConfigFileBeenRead) {
      return;
    }
    try {
      const data = await readFile(Config.FILE_NAME, { encoding: 'utf-8' });
      this.params = JSON.parse(data);
      this.hasConfigFileBeenRead = true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        await this.saveToConfigFile();
        this.hasConfigFileBeenRead = true;
      } else {
        console.log('Error reading config file', error);
      }
    }
  }

  async saveToConfigFile() {
    try {
      const json = JSON.stringify(this.params);
      await writeFile(Config.FILE_NAME, json, {encoding: 'utf-8'});
    } catch (error) {
      console.log('Error writing to config file', error);
    }
  }
}
