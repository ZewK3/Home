const Loader = () => {
  return (
    <div className="dashboard-loader">
      <div className="loader-content">
        <div className="dual-spinner-container">
          <div className="spinner-outer"></div>
          <div className="spinner-inner"></div>
        </div>
        <h3 className="loader-title">Đang tải Dashboard...</h3>
        <p className="loader-subtitle">Vui lòng đợi trong giây lát</p>
        <div className="loader-progress">
          <div className="progress-bar"></div>
        </div>
      </div>
      <div className="loader-background">
        <div className="floating-particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
      </div>
    </div>
  )
}

export default Loader