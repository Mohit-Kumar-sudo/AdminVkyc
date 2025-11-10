// Authentication Request
export interface Authenticate {
	username: string;
	password: string;
}

export interface ForgotPassword {
	email: string;
}

export interface UserToken {
  data: any;
	token: string | undefined;
}

