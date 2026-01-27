import * as api from './index';

describe('API Index', () => {
  it('should export APIClient', () => {
    expect(api.APIClient).toBeDefined();
  });

  it('should export APIError', () => {
    expect(api.APIError).toBeDefined();
  });

  it('should export apiClient', () => {
    expect(api.apiClient).toBeDefined();
  });

  it('should export authAPI', () => {
    expect(api.authAPI).toBeDefined();
  });

  it('should export propertiesAPI', () => {
    expect(api.propertiesAPI).toBeDefined();
  });

  it('should export roomsAPI', () => {
    expect(api.roomsAPI).toBeDefined();
  });

  it('should export roomTypesAPI', () => {
    expect(api.roomTypesAPI).toBeDefined();
  });

  it('should export guestsAPI', () => {
    expect(api.guestsAPI).toBeDefined();
  });

  it('should export reservationsAPI', () => {
    expect(api.reservationsAPI).toBeDefined();
  });

  it('should export getAuthToken', () => {
    expect(api.getAuthToken).toBeDefined();
  });

  it('should export setAuthToken', () => {
    expect(api.setAuthToken).toBeDefined();
  });

  it('should export clearAuthToken', () => {
    expect(api.clearAuthToken).toBeDefined();
  });
});
