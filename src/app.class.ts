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

    const environment = await app.chooseEnvironment();
    const user = await app.chooseUser(environment);
    console.log(environment, user);
  }

  async chooseEnvironment(): Promise<Environment> {
    if (this.config.params.environments.length === 0) {
      console.log('No environments found, register a new one');
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
        name: 'Register new environment:',
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

  async chooseUser(environment: Environment): Promise<User> {
    if (environment.users.length === 0) {
      console.log('No users found, register a new one');
    }
    if (environment.users.length > 0) {
      const userChoices = [
        ...environment.users.map((user: User) => {
          return {
            name: user.username,
            value: user
          };
        }),
        this.separator,
        {
          name: 'Register new user',
          value: 'new'
        }
      ];
      const answers = await this.prompt([{
        type: 'list',
        name: 'user',
        message: 'Select a user:',
        choices: userChoices
      }]);
      if (answers.user !== 'new') {
        return answers.user;
      }
    }

    const user = await this.promptUserDetails();
    environment.users.push(user);
    if (!environment.inMemoryOnly) {
      await this.config.saveToConfigFile();
    }
    return user;
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
    } else {
      environment.inMemoryOnly = true;
    }
    return environment;
  }

  async promptEnvironmentDetails(): Promise<Environment> {
    let answers = await this.prompt([
      {
        type: 'input',
        name: 'label',
        message: 'Enter a label to name your environment:'
      },
      {
        type: 'input',
        name: 'host',
        message: 'Enter the host of the environment:'
      }
    ]);
    return {
      label: answers.label,
      host: answers.host,
      users: []
    }
  }

  async promptUserDetails(): Promise<User> {
    const answers = await this.prompt([
      {
        type: 'input',
        name: 'username',
        message: 'Enter the username:'
      },
      {
        type: 'password',
        name: 'password',
        message: 'Enter the password (leave blank to prompt before each operation):',
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
