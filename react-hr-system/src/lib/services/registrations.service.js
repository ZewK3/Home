// Registration/Queue Management Service - Placeholder since worker lacks registration endpoints

export const registrationService = {
  async getPending() {
    throw new Error('Registrations API not implemented in worker');
  },
  async approve() {
    throw new Error('Registrations API not implemented in worker');
  },
  async reject() {
    throw new Error('Registrations API not implemented in worker');
  }
};