export const config = {
    host: process.env.DATABASE_HOST,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD
}

export const base_noauth = {
  loggedin: false,
  user: {
    username: "",
    displayname: "",
    email: "",
    imgurl: "",
    created: ""
  },
  custom: {
    dashboard: true,
    planner: true,
    inbox: true,
    teams: true,
    projects: true,
    profile: true,
    settings: true
  }
}

export interface baseauthtype {
  loggedin: boolean,
  user: {
    username: string,
    displayname: string,
    email: string,
    imgurl: string,
    created: string
  },
  custom: {
    dashboard: boolean,
    planner: boolean,
    inbox: boolean,
    teams: boolean,
    projects: boolean,
    profile: boolean,
    settings: boolean
  }
}