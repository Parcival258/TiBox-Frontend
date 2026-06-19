import styled from 'styled-components'

type SwitchProps = {
  checked: boolean
  disabled?: boolean
  label: string
  onChange: (checked: boolean) => void
}

export function Switch({ checked, disabled = false, label, onChange }: SwitchProps) {
  return (
    <StyledWrapper>
      <label className="switch" title={label}>
        <span className="sr-only">{label}</span>
        <input
          aria-label={label}
          checked={checked}
          disabled={disabled}
          type="checkbox"
          onChange={(event) => onChange(event.target.checked)}
        />
        <span aria-hidden="true" className="slider" />
      </label>
    </StyledWrapper>
  )
}

const StyledWrapper = styled.div`
  .switch {
    position: relative;
    display: inline-block;
    width: 3.5em;
    height: 2em;
    font-size: 17px;
  }

  .switch input {
    position: absolute;
    width: 0;
    height: 0;
    opacity: 0;
  }

  .slider {
    position: absolute;
    inset: 0;
    cursor: pointer;
    border-radius: 50px;
    background: #9fccfa;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .slider::before {
    position: absolute;
    inset: 0;
    display: flex;
    width: 2em;
    height: 2em;
    align-items: center;
    justify-content: center;
    border-radius: 50px;
    background-color: white;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
    content: '';
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .switch input:checked + .slider {
    background: #0974f1;
  }

  .switch input:focus-visible + .slider {
    outline: 2px solid #67e8f9;
    outline-offset: 3px;
  }

  .switch input:checked + .slider::before {
    transform: translateX(1.6em);
  }

  .switch input:disabled + .slider {
    cursor: not-allowed;
    opacity: 0.45;
  }
`
