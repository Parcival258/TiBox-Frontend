import './AddItemButton.css'

type AddItemButtonProps = {
  label: string
  onClick: () => void
}

export function AddItemButton({ label, onClick }: AddItemButtonProps) {
  return (
    <button className="add-item-button" type="button" onClick={onClick}>
      <span className="add-item-button__icon" aria-hidden="true" />
      <span className="add-item-button__text">{label}</span>
    </button>
  )
}
