const DEFAULT_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=5',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=6',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=7',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=8',
];

export default function AvatarPicker({ selected, onSelect, customUrl, onCustomUrlChange, onSave, showSave = false }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 14, color: '#666', marginBottom: 12 }}>
        Choose a default avatar
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {DEFAULT_AVATARS.map((url) => (
          <button
            key={url}
            onClick={() => onSelect(url)}
            style={{
              background: selected === url ? '#C0E1D2' : '#F8F7F2',
              border: selected === url ? '2px solid #4A9B7F' : '2px solid transparent',
              borderRadius: 12,
              padding: 8,
              cursor: 'pointer',
            }}
          >
            <img
              src={url}
              alt="avatar"
              style={{ width: '100%', aspectRatio: '1', borderRadius: '50%', objectFit: 'cover' }}
            />
          </button>
        ))}
      </div>

      <label style={{ display: 'block', fontSize: 14, color: '#666', marginBottom: 8 }}>
        Or enter a custom image URL
      </label>
      <div style={{ display: 'flex', gap: 12 }}>
        <input
          type="text"
          value={customUrl || ''}
          onChange={(e) => onCustomUrlChange(e.target.value)}
          placeholder="https://example.com/avatar.jpg"
          style={{ flex: 1 }}
        />
        {showSave && (
          <button
            onClick={onSave}
            style={{
              backgroundColor: '#C0E1D2',
              color: '#1A3A2A',
              padding: '10px 20px',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Save
          </button>
        )}
      </div>
    </div>
  );
}

export { DEFAULT_AVATARS };
