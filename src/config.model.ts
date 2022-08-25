export interface User {
  username: string;
  password?: string;
}

export interface Environment {
  label: string;
  host: string;
  users: User[];
}

export interface ConfigParams {
  environments: Environment[];
}
