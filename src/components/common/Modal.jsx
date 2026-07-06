import styles from './Modal.module.css'

export function Modal({ title, children, onConfirm, onCancel, confirmLabel = '확인', cancelLabel = '취소' }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.box}>
        {title && <h3 className={styles.title}>{title}</h3>}
        {children && <div className={styles.body}>{children}</div>}
        <div className={styles.actions}>
          {onCancel && (
            <button className={styles.cancelBtn} onClick={onCancel}>{cancelLabel}</button>
          )}
          {onConfirm && (
            <button className={styles.confirmBtn} onClick={onConfirm}>{confirmLabel}</button>
          )}
        </div>
      </div>
    </div>
  )
}
