const AUTH_API_URL = '/whoami'
const CONSOLE_PLATFORM_API_URL = '/console/private/platform/infos'

type KNOWN_ROLES =
  | 'ROLE_SUPERUSER'
  | 'ROLE_ORGADMIN'
  | 'ROLE_MAPSTORE_ADMIN'
  | 'ROLE_USER'
  | 'ROLE_ADMINISTRATOR'
  | 'ROLE_EXTRACTORAPP'
  | 'ROLE_GN_REVIEWER'
  | 'ROLE_GN_EDITOR'
  | 'ROLE_GN_ADMIN'
  | 'ROLE_EMAILPROXY'
  | 'ROLE_ANONYMOUS'
  | 'ROLE_IMPORT'

interface WhoAmIResponse {
  GeorchestraUser: {
    roles: string[]
    username: string
    firstName: string
    lastName: string
    ldapWarn: boolean
    ldapRemainingDays: string
  }
}

export interface User {
  username: string
  firstname?: string
  lastname?: string
  anonymous: boolean
  warned: boolean
  remainingDays: string
  roles: string[]
}

export async function getUserDetails(): Promise<User> {
  const jsonFake = {
    "GeorchestraUser": {
      "username": "jdoe",
      "roles": [
        "ROLE_MAPSTORE_ADMIN",
        "ROLE_DSP_ILEVIA",
        "ROLE_GN_EDITOR",
        "ROLE_USER",
        "ROLE_ADMINISTRATOR",
        "ROLE_SUPERUSER"
      ],
      "organization": "georchestra",
      "id": "961b3749-d5c13b2df7",
      "lastUpdated": "37ad990ece9c0b0e6d42b52fdce45849292cd9468",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@yopmail.com",
      "postalAddress": null,
      "telephoneNumber": null,
      "title": null,
      "notes": null,
      "ldapWarn": false,
      "ldapRemainingDays": null,
      "isExternalAuth": false,
      "oauth2Provider": null,
      "oauth2Uid": null
    }
  }

  return fetch(AUTH_API_URL)
    .then(response => jsonFake)
    .then((json: WhoAmIResponse) => {
      const user = json.GeorchestraUser
      if (!user) {
        return {
          username: 'anonymousUser',
          warned: false,
          remainingDays: '0',
          anonymous: true,
          roles: ['ROLE_ANONYMOUS'],
        }
      }
      return {
        username: user.username,
        firstname: user.firstName,
        lastname: user.lastName,
        warned: user.ldapWarn,
        remainingDays: user.ldapRemainingDays,
        anonymous: user.roles.indexOf('ROLE_ANONYMOUS') > -1,
        roles: user.roles,
      }
    })
}

export interface PlatformInfos {
  analyticsEnabled: boolean
  extractorappEnabled: boolean
  saslEnabled: boolean
}

export async function getPlatformInfos(): Promise<PlatformInfos> {
  return fetch(CONSOLE_PLATFORM_API_URL)
    .then(response => response.json())
    .then((json: PlatformInfos) => {
      return {
        analyticsEnabled: json.analyticsEnabled,
        extractorappEnabled: json.extractorappEnabled,
        saslEnabled: json.saslEnabled,
      }
    })
}
