import { createPromptModule, PromptModule } from 'inquirer';

import { Config } from './config.class';
import { Environment, User } from './config.model';

export class App {
  readonly prompt: PromptModule = createPromptModule();
  readonly separator = { type: 'separator' };

  config: Config = new Config();

  static async startApp() {
    const app = new App();
    await app.config.readConfigFile();
    console.log(await app.chooseEnvironment());
  }

  async chooseEnvironment(): Promise<Environment> {
    if (this.config.params.environments.length === 0) {
      return await this.setupNewEnvironment();
    }

    const environmentChoices = [
      ...this.config.params.environments.map((env: Environment) => {
        return {
          name: env.label,
          value: env
        }
      }),
      this.separator,
      {
        name: 'Setup new environment',
        value: 'new'
      }
    ];
    const answers = await this.prompt([{
      type: 'list',
      name: 'environment',
      message: 'Select an environment to use',
      choices: environmentChoices
    }]);
    if (answers.environment === 'new') {
      return await this.setupNewEnvironment();
    }
    return answers.environment;
  }

  async setupNewEnvironment(): Promise<Environment> {
    const environment = await this.promptEnvironmentDetails();
    const answers = await this.prompt([
      {
        type: 'confirm',
        name: 'saveToConfigFile',
        message: 'Save this environment for future use?',
        default: true
      }
    ]);
    if (answers.saveToConfigFile) {
      this.config.params.environments.push(environment);
      await this.config.saveToConfigFile();
    }
    return environment;
  }

  async promptEnvironmentDetails(): Promise<Environment> {
    let answers = await this.prompt([
      {
        type: 'input',
        name: 'label',
        message: 'Enter a label to name your environment'
      },
      {
        type: 'input',
        name: 'host',
        message: 'Enter the host of the environment'
      }
    ]);
    const user = await this.promptUserDetails();
    return {
      label: answers.label,
      host: answers.host,
      users: [user]
    }
  }

  async promptUserDetails(): Promise<User> {
    const answers = await this.prompt([
      {
        type: 'input',
        name: 'username',
        message: 'Enter the username'
      },
      {
        type: 'password',
        name: 'password',
        message: 'Enter the password (leave blank to prompt before each operation)',
        mask: '*'
      }
    ]);
    const user: User = {
      username: answers.username,
      savePassword: answers.password !== ''
    };
    if (answers.password !== '') {
      user.password = answers.password;
    }
    return user;
  }
}
