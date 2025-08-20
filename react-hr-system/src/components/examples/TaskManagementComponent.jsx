import { useState, useEffect } from 'react'
import { taskService } from '../../lib/services/tasks.service.js'
import { useAuth } from '../../context/AuthContext.jsx'

/**
 * Example component for task management
 * Shows how to replace old JS DOM manipulation with React hooks
 */
const TaskManagementComponent = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState({})

  // Check user permissions
  const canCreateTasks = user && ['AD', 'QL'].includes(user.role || user.position)
  const canApproveTasks = user && ['AD', 'QL'].includes(user.role || user.position)

  useEffect(() => {
    loadTasks()
  }, [filter])

  const loadTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = {}
      if (filter !== 'all') {
        params.status = filter
      }
      if (!canCreateTasks) {
        // Regular employees only see their own tasks
        params.employeeId = user?.employeeId
      }
      
      const data = await taskService.getTasks(params)
      setTasks(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('Không thể tải danh sách công việc')
      console.error('Failed to load tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async () => {
    const assigneeId = prompt('Mã nhân viên được giao việc:')
    if (!assigneeId) return

    const description = prompt('Mô tả công việc:')
    if (!description) return

    const deadline = prompt('Hạn hoàn thành (YYYY-MM-DD):')
    if (!deadline) return

    setLoading(true)
    
    try {
      const taskData = {
        assigneeId,
        description,
        deadline,
        priority: 'normal',
        createdBy: user?.employeeId
      }
      
      await taskService.createTask(taskData)
      alert('Tạo công việc thành công!')
      loadTasks() // Reload tasks
    } catch (err) {
      alert(`Lỗi khi tạo công việc: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveTask = async (taskId, description) => {
    if (!window.confirm(`Xác nhận hoàn thành công việc: ${description}?`)) {
      return
    }

    setProcessing(prev => ({ ...prev, [taskId]: 'approving' }))
    
    try {
      await taskService.approveTask(taskId, 'Đã xác nhận hoàn thành')
      
      // Update task status locally
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, status: 'completed', approvedAt: new Date().toISOString() }
          : task
      ))
      
      alert('Đã duyệt công việc hoàn thành')
    } catch (err) {
      alert(`Lỗi khi duyệt: ${err.message}`)
    } finally {
      setProcessing(prev => ({ ...prev, [taskId]: null }))
    }
  }

  const handleRejectTask = async (taskId, description) => {
    const reason = prompt(`Lý do từ chối công việc "${description}":`)
    if (!reason) return

    setProcessing(prev => ({ ...prev, [taskId]: 'rejecting' }))
    
    try {
      await taskService.rejectTask(taskId, reason)
      
      // Update task status locally
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, status: 'rejected', rejectedAt: new Date().toISOString(), rejectionReason: reason }
          : task
      ))
      
      alert('Đã từ chối công việc')
    } catch (err) {
      alert(`Lỗi khi từ chối: ${err.message}`)
    } finally {
      setProcessing(prev => ({ ...prev, [taskId]: null }))
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b'
      case 'in-progress': return '#3b82f6'
      case 'completed': return '#10b981'
      case 'rejected': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý'
      case 'in-progress': return 'Đang thực hiện'
      case 'completed': return 'Hoàn thành'
      case 'rejected': return 'Bị từ chối'
      default: return 'Không xác định'
    }
  }

  if (loading && tasks.length === 0) {
    return (
      <div className="task-management">
        <div className="loading">
          <span className="material-icons-round rotating">refresh</span>
          <p>Đang tải danh sách công việc...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="task-management">
      <div className="header">
        <h3>Quản lý công việc</h3>
        <div className="header-actions">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả</option>
            <option value="pending">Chờ xử lý</option>
            <option value="in-progress">Đang thực hiện</option>
            <option value="completed">Hoàn thành</option>
            <option value="rejected">Bị từ chối</option>
          </select>
          
          {canCreateTasks && (
            <button onClick={handleCreateTask} className="create-task-btn">
              <span className="material-icons-round">add</span>
              Tạo công việc
            </button>
          )}
          
          <button onClick={loadTasks} className="refresh-btn">
            <span className="material-icons-round">refresh</span>
            Làm mới
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span className="material-icons-round">error</span>
          <span>{error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="no-tasks">
          <span className="material-icons-round">assignment</span>
          <p>Không có công việc nào</p>
        </div>
      ) : (
        <div className="tasks-list">
          {tasks.map((task) => (
            <div key={task.id} className="task-card">
              <div className="task-header">
                <h4>{task.description}</h4>
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(task.status) }}
                >
                  {getStatusText(task.status)}
                </span>
              </div>
              
              <div className="task-details">
                <p><strong>Được giao cho:</strong> {task.assigneeName || task.assigneeId}</p>
                <p><strong>Người giao:</strong> {task.creatorName || task.createdBy}</p>
                <p><strong>Hạn hoàn thành:</strong> {new Date(task.deadline).toLocaleDateString()}</p>
                <p><strong>Tạo lúc:</strong> {new Date(task.createdAt).toLocaleString()}</p>
                
                {task.approvedAt && (
                  <p><strong>Duyệt lúc:</strong> {new Date(task.approvedAt).toLocaleString()}</p>
                )}
                
                {task.rejectionReason && (
                  <p><strong>Lý do từ chối:</strong> {task.rejectionReason}</p>
                )}
              </div>

              {canApproveTasks && task.status === 'in-progress' && (
                <div className="task-actions">
                  <button 
                    className="approve-btn"
                    onClick={() => handleApproveTask(task.id, task.description)}
                    disabled={processing[task.id]}
                  >
                    {processing[task.id] === 'approving' ? (
                      <>
                        <span className="material-icons-round rotating">check_circle</span>
                        Đang duyệt...
                      </>
                    ) : (
                      <>
                        <span className="material-icons-round">check_circle</span>
                        Duyệt hoàn thành
                      </>
                    )}
                  </button>
                  
                  <button 
                    className="reject-btn"
                    onClick={() => handleRejectTask(task.id, task.description)}
                    disabled={processing[task.id]}
                  >
                    {processing[task.id] === 'rejecting' ? (
                      <>
                        <span className="material-icons-round rotating">cancel</span>
                        Đang từ chối...
                      </>
                    ) : (
                      <>
                        <span className="material-icons-round">cancel</span>
                        Từ chối
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="task-summary">
        <p><strong>Tổng số công việc:</strong> {tasks.length}</p>
        <p><strong>Người dùng:</strong> {user?.fullName || user?.name}</p>
        <p><strong>Quyền hạn:</strong> {user?.role || user?.position}</p>
      </div>
    </div>
  )
}

export default TaskManagementComponent