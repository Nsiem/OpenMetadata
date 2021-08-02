# User entity

## user

```text
https://github.com/StreamlineData/catalog/blob/master/catalog-rest-service/src/main/resources/json/schema/entity/teams/user.json
```

User entity that is part of an organization

| Abstract | Extensible | Status | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Can be instantiated | Yes | Unknown status | No | Forbidden | Allowed | none | [user.json](https://github.com/StreamlineData/catalog/tree/7a2138a90f4fb063ef6d4f8cac3a2668f1dcf67b/docs/api/schemas/https:/github.com/StreamlineData/catalog/blob/master/catalog-rest-service/src/main/resources/json/schema/entity/teams/user.json) |

### User entity Type

`object` \([User entity](user.md)\)

## User entity Properties

| Property | Type | Required | Nullable | Defined by |
| :--- | :--- | :--- | :--- | :--- |
| [id](user.md#id) | `string` | Required | cannot be null | [Common type](../types/common.md#common-definitions-uuid) |
| [name](user.md#name) | `string` | Required | cannot be null | [User entity](user.md#user-properties-name) |
| [displayName](user.md#displayname) | `string` | Optional | cannot be null | [User entity](user.md#user-properties-displayname) |
| [email](user.md#email) | `string` | Required | cannot be null | [User entity](https://github.com/StreamlineData/catalog/tree/7a2138a90f4fb063ef6d4f8cac3a2668f1dcf67b/docs/api/schemas/entities/common-definitions-email.md) |
| [href](user.md#href) | `string` | Required | cannot be null | [Common type](../types/common.md#common-definitions-href) |
| [timezone](user.md#timezone) | `string` | Optional | cannot be null | [User entity](user.md#user-properties-timezone) |
| [deactivated](user.md#deactivated) | `boolean` | Optional | cannot be null | [User entity](user.md#user-properties-deactivated) |
| [isBot](user.md#isbot) | `boolean` | Optional | cannot be null | [User entity](user.md#user-properties-isbot) |
| [isAdmin](user.md#isadmin) | `boolean` | Optional | cannot be null | [User entity](user.md#user-properties-isAdmin) |
| [profile](user.md#profile) | `object` | Optional | cannot be null | [Common type](https://github.com/StreamlineData/catalog/tree/7a2138a90f4fb063ef6d4f8cac3a2668f1dcf67b/docs/api/schemas/types/Common/common-definitions-profile.md#common-definitions-profile) |
| [teams](user.md#teams) | `array` | Optional | cannot be null | [Common type](../types/common.md#common-definitions-entityreferencelist) |
| [owns](user.md#owns) | `array` | Optional | cannot be null | [Common type](../types/common.md#common-definitions-entityreferencelist) |
| [follows](user.md#follows) | `array` | Optional | cannot be null | [Common type](../types/common.md#common-definitions-entityreferencelist) |

### id

Unique id used to identify an entity

`id`

* is required
* Type: `string`
* cannot be null
* defined in: [Common type](../types/common.md#common-definitions-uuid)

#### id Type

`string`

#### id Constraints

**UUID**: the string must be a UUID, according to [RFC 4122](https://tools.ietf.org/html/rfc4122)

### name

Unique name of the user typically the user ID from the identify provider. Example - uid from ldap.

`name`

* is required
* Type: `string`
* cannot be null
* defined in: [User entity](user.md#user-properties-name)

#### name Type

`string`

#### name Constraints

**maximum length**: the maximum number of characters for this string is: `64`

**minimum length**: the minimum number of characters for this string is: `1`

### displayName

Name used for display purposes. Example 'FirstName LastName'

`displayName`

* is optional
* Type: `string`
* cannot be null
* defined in: [User entity](user.md#user-properties-displayname)

#### displayName Type

`string`

### email

Email address of user or other entities

`email`

* is required
* Type: `string`
* cannot be null
* defined in: [User entity](https://github.com/StreamlineData/catalog/tree/7a2138a90f4fb063ef6d4f8cac3a2668f1dcf67b/docs/api/schemas/entities/common-definitions-email.md)

#### email Type

`string`

#### email Constraints

**maximum length**: the maximum number of characters for this string is: `127`

**minimum length**: the minimum number of characters for this string is: `6`

**pattern**: the string must match the following regular expression:

```text
^\S+@\S+\.\S+$
```

[try pattern](https://regexr.com/?expression=%5E%5CS%2B%40%5CS%2B%5C.%5CS%2B%24)

**email**: the string must be an email address, according to [RFC 5322, section 3.4.1](https://tools.ietf.org/html/rfc5322)

### href

Link to the resource corresponding to this entity

> Link to the resource

`href`

* is required
* Type: `string`
* cannot be null
* defined in: [Common type](../types/common.md#common-definitions-href)

#### href Type

`string`

#### href Constraints

**URI**: the string must be a URI, according to [RFC 3986](https://tools.ietf.org/html/rfc3986)

### timezone

Timezone of the user

`timezone`

* is optional
* Type: `string`
* cannot be null
* defined in: [User entity](user.md#user-properties-timezone)

#### timezone Type

`string`

#### timezone Constraints

**unknown format**: the value of this string must follow the format: `timezone`

### deactivated

`deactivated`

* is optional
* Type: `boolean`
* cannot be null
* defined in: [User entity](user.md#user-properties-deactivated)

#### deactivated Type

`boolean`

### isBot

`isBot`

* is optional
* Type: `boolean`
* cannot be null
* defined in: [User entity](user.md#user-properties-isbot)

#### isBot Type

`boolean`

### isAdmin

When true indicates user is an adiministrator for the sytem with superuser privileges

`isAdmin`

* is optional
* Type: `boolean`
* cannot be null
* defined in: [User entity](user.md#user-properties-isAdmin)

#### isAdmin Type

`boolean`

### profile

> Profile of a user, team, or an organization

`profile`

* is optional
* Type: `object` \([Details](../types/common.md#common-definitions-profile)\)
* cannot be null
* defined in: [Common type](https://github.com/StreamlineData/catalog/tree/7a2138a90f4fb063ef6d4f8cac3a2668f1dcf67b/docs/api/schemas/types/Common/common-definitions-profile.md#common-definitions-profile)

#### profile Type

`object` \([Details](../types/common.md#common-definitions-profile)\)

### teams

Teams that the user belongs to

`teams`

* is optional
* Type: `object[]` \([Details](../types/common.md#common-definitions-entityreference)\)
* cannot be null
* defined in: [Common type](../types/common.md#common-definitions-entityreferencelist)

#### teams Type

`object[]` \([Details](../types/common.md#common-definitions-entityreference)\)

### owns

Entities owned by the user

`owns`

* is optional
* Type: `object[]` \([Details](../types/common.md#common-definitions-entityreference)\)
* cannot be null
* defined in: [Common type](../types/common.md#common-definitions-entityreferencelist)

#### owns Type

`object[]` \([Details](../types/common.md#common-definitions-entityreference)\)

### follows

Entities followed by the user

`follows`

* is optional
* Type: `object[]` \([Details](../types/common.md#common-definitions-entityreference)\)
* cannot be null
* defined in: [Common type](../types/common.md#common-definitions-entityreferencelist)

#### follows Type

`object[]` \([Details](../types/common.md#common-definitions-entityreference)\)

## User entity Definitions

### Definitions group userName

Reference this group by using

```javascript
{"$ref":"https://github.com/StreamlineData/catalog/blob/master/catalog-rest-service/src/main/resources/json/schema/entity/teams/user.json#/definitions/userName"}
```

| Property | Type | Required | Nullable | Defined by |
| :--- | :--- | :--- | :--- | :--- |


## user-definitions-username

```text
https://github.com/StreamlineData/catalog/blob/master/catalog-rest-service/src/main/resources/json/schema/entity/teams/user.json#/definitions/userName
```

Unique name of the user typically the user ID from the identify provider. Example - uid from ldap.

| Abstract | Extensible | Status | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Can be instantiated | No | Unknown status | Unknown identifiability | Forbidden | Allowed | none | [user.json\*](https://github.com/StreamlineData/catalog/tree/7a2138a90f4fb063ef6d4f8cac3a2668f1dcf67b/docs/api/schemas/https:/github.com/StreamlineData/catalog/blob/master/catalog-rest-service/src/main/resources/json/schema/entity/teams/user.json) |

### userName Type

`string`

### userName Constraints

**maximum length**: the maximum number of characters for this string is: `64`

**minimum length**: the minimum number of characters for this string is: `1`

## user-definitions

```text
https://github.com/StreamlineData/catalog/blob/master/catalog-rest-service/src/main/resources/json/schema/entity/teams/user.json#/definitions
```

| Abstract | Extensible | Status | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Can be instantiated | No | Unknown status | Unknown identifiability | Forbidden | Allowed | none | [user.json\*](https://github.com/StreamlineData/catalog/tree/7a2138a90f4fb063ef6d4f8cac3a2668f1dcf67b/docs/api/schemas/https:/github.com/StreamlineData/catalog/blob/master/catalog-rest-service/src/main/resources/json/schema/entity/teams/user.json) |

### definitions Type

unknown

## user-properties-deactivated

```text
https://github.com/StreamlineData/catalog/blob/master/catalog-rest-service/src/main/resources/json/schema/entity/teams/user.json#/properties/deactivated
```

| Abstract | Extensible | Status | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Can be instantiated | No | Unknown status | Unknown identifiability | Forbidden | Allowed | none | [user.json\*](https://github.com/StreamlineData/catalog/tree/7a2138a90f4fb063ef6d4f8cac3a2668f1dcf67b/docs/api/schemas/https:/github.com/StreamlineData/catalog/blob/master/catalog-rest-service/src/main/resources/json/schema/entity/teams/user.json) |

### deactivated Type

`boolean`

## user-properties-displayname

```text
https://github.com/StreamlineData/catalog/blob/master/catalog-rest-service/src/main/resources/json/schema/entity/teams/user.json#/properties/displayName
```

Name used for display purposes. Example 'FirstName LastName'

| Abstract | Extensible | Status | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Can be instantiated | No | Unknown status | Unknown identifiability | Forbidden | Allowed | none | [user.json\*](https://github.com/StreamlineData/catalog/tree/7a2138a90f4fb063ef6d4f8cac3a2668f1dcf67b/docs/api/schemas/https:/github.com/StreamlineData/catalog/blob/master/catalog-rest-service/src/main/resources/json/schema/entity/teams/user.json) |

### displayName Type

`string`

## user-properties-isadmin

```text
https://github.com/StreamlineData/catalog/blob/master/catalog-rest-service/src/main/resources/json/schema/entity/teams/user.json#/properties/isAdmin
```

When true indicates user is an adiministrator for the sytem with superuser privileges

| Abstract | Extensible | Status | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Can be instantiated | No | Unknown status | Unknown identifiability | Forbidden | Allowed | none | [user.json\*](https://github.com/StreamlineData/catalog/tree/7a2138a90f4fb063ef6d4f8cac3a2668f1dcf67b/docs/api/schemas/https:/github.com/StreamlineData/catalog/blob/master/catalog-rest-service/src/main/resources/json/schema/entity/teams/user.json) |

### isAdmin Type

`boolean`

## user-properties-isbot

```text
https://github.com/StreamlineData/catalog/blob/master/catalog-rest-service/src/main/resources/json/schema/entity/teams/user.json#/properties/isBot
```

| Abstract | Extensible | Status | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Can be instantiated | No | Unknown status | Unknown identifiability | Forbidden | Allowed | none | [user.json\*](https://github.com/StreamlineData/catalog/tree/7a2138a90f4fb063ef6d4f8cac3a2668f1dcf67b/docs/api/schemas/https:/github.com/StreamlineData/catalog/blob/master/catalog-rest-service/src/main/resources/json/schema/entity/teams/user.json) |

### isBot Type

`boolean`

## user-properties-name

```text
https://github.com/StreamlineData/catalog/blob/master/catalog-rest-service/src/main/resources/json/schema/entity/teams/user.json#/properties/name
```

Unique name of the user typically the user ID from the identify provider. Example - uid from ldap.

| Abstract | Extensible | Status | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Can be instantiated | No | Unknown status | Unknown identifiability | Forbidden | Allowed | none | [user.json\*](https://github.com/StreamlineData/catalog/tree/7a2138a90f4fb063ef6d4f8cac3a2668f1dcf67b/docs/api/schemas/https:/github.com/StreamlineData/catalog/blob/master/catalog-rest-service/src/main/resources/json/schema/entity/teams/user.json) |

### name Type

`string`

### name Constraints

**maximum length**: the maximum number of characters for this string is: `64`

**minimum length**: the minimum number of characters for this string is: `1`

## user-properties-timezone

```text
https://github.com/StreamlineData/catalog/blob/master/catalog-rest-service/src/main/resources/json/schema/entity/teams/user.json#/properties/timezone
```

Timezone of the user

| Abstract | Extensible | Status | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Can be instantiated | No | Unknown status | Unknown identifiability | Forbidden | Allowed | none | [user.json\*](https://github.com/StreamlineData/catalog/tree/7a2138a90f4fb063ef6d4f8cac3a2668f1dcf67b/docs/api/schemas/https:/github.com/StreamlineData/catalog/blob/master/catalog-rest-service/src/main/resources/json/schema/entity/teams/user.json) |

### timezone Type

`string`

### timezone Constraints

**unknown format**: the value of this string must follow the format: `timezone`
