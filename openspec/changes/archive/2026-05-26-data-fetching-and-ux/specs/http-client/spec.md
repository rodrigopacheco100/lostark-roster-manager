## ADDED Requirements

### Requirement: A generic HTTP client SHALL exist in src/lib/api.ts
The app SHALL have a single `http` object in `src/lib/api.ts` with methods for all HTTP verbs that all pages use for API calls.

#### Scenario: Page makes a GET request
- **WHEN** a page needs to fetch data
- **THEN** it SHALL import and call `http.get<T>(url)` from `src/lib/api.ts`

#### Scenario: Page makes a POST request
- **WHEN** a page needs to create a resource
- **THEN** it SHALL call `http.post<T>(url, data)` with the request body

#### Scenario: Page makes a PUT request
- **WHEN** a page needs to update a resource
- **THEN** it SHALL call `http.put<T>(url, data)` with the updated data

#### Scenario: Page makes a PATCH request
- **WHEN** a page needs to partially update a resource
- **THEN** it SHALL call `http.patch<T>(url, data)` with the partial data

#### Scenario: Page makes a DELETE request
- **WHEN** a page needs to delete a resource
- **THEN** it SHALL call `http.delete<T>(url, data?)`, optionally passing a body

### Requirement: The HTTP client SHALL use axios
Every method SHALL use `axios` as the underlying HTTP client instead of the native `fetch` API.

#### Scenario: HttpClient makes a request
- **WHEN** any `http` method is called
- **THEN** it SHALL use the corresponding `axios.<method>` function internally

### Requirement: The HTTP client SHALL extract error messages from API responses
On error, the http client SHALL extract the error message from `error.response.data.error` and throw it as an `Error`.

#### Scenario: API returns an error response
- **WHEN** the API responds with a non-2xx status and `{ error: string }`
- **THEN** the http client SHALL throw `new Error(error.response.data.error)`

### Requirement: The HTTP client SHALL handle non-standard delete bodies
DELETE requests that require a request body SHALL pass it via axios's `{ data }` config.

#### Scenario: DELETE with body
- **WHEN** `http.delete(url, data)` is called with data
- **THEN** it SHALL call `axios.delete(url, { data })` to include the body
