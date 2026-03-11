interface LoadingIndicatorProps {
  action?: 'searching' | 'booking' | 'default' | 'add_to_calendar'
}

export function LoadingIndicator({ action = 'default' }: LoadingIndicatorProps) {
  const getMessage = () => {
    switch (action) {
      case 'searching':
        return 'Searching for available rooms'
      case 'booking':
        return 'Processing your meeting request'
      default:
        return 'Thinking'
    }
  }

  return (
    <div className="space-y-2">
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <span className="text-sm text-gray-600 font-medium">{getMessage()}</span>
        <span style={{
          display: 'inline-block',
          height: 6,
          width: 6,
          borderRadius: '50%',
          background: '#f97316',
          marginLeft: 4,
          animation: 'bouncedots 1s infinite',
          animationDelay: '0s',
        }} />
        <span style={{
          display: 'inline-block',
          height: 6,
          width: 6,
          borderRadius: '50%',
          background: '#f97316',
          marginLeft: 2,
          animation: 'bouncedots 1s infinite',
          animationDelay: '0.15s',
        }} />
        <span style={{
          display: 'inline-block',
          height: 6,
          width: 6,
          borderRadius: '50%',
          background: '#f97316',
          marginLeft: 2,
          animation: 'bouncedots 1s infinite',
          animationDelay: '0.3s',
        }} />
      </span>
      <style>{`
        @keyframes bouncedots {
          0%, 80%, 100% { transform: scale(1); opacity: 1; }
          40% { transform: scale(1.5); opacity: 0.7; }
        }
      `}</style>
    </div>
  )
}
