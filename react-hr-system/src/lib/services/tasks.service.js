// Task Management Service - Placeholder since worker lacks /tasks endpoints

export const taskService = {
  async getTasks() {
    throw new Error('Tasks API not implemented in worker');
  },
  async createTask() {
    throw new Error('Tasks API not implemented in worker');
  },
  async approveTask() {
    throw new Error('Tasks API not implemented in worker');
  },
  async rejectTask() {
    throw new Error('Tasks API not implemented in worker');
  }
};