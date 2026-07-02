import html2canvas from 'html2canvas'

export async function capturePhotoCard(stageEl, bgColor = '#ffffff', bgImage = null) {
  // 스테이지는 transparent이므로 캐릭터/의상만 캡처
  const captured = await html2canvas(stageEl, {
    backgroundColor: null,
    useCORS: true,
    scale: 2,
    logging: false,
  })

  const sw = captured.width
  const sh = captured.height

  const padH   = Math.round(sw * 0.06)
  const padTop  = Math.round(sw * 0.14)
  const padBot  = Math.round(sw * 0.20)
  const cardW   = sw + padH * 2
  const cardH   = sh + padTop + padBot

  const canvas = document.createElement('canvas')
  canvas.width  = cardW
  canvas.height = cardH
  const ctx = canvas.getContext('2d')

  // 카드 전체 흰 배경
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, cardW, cardH)

  // 스테이지 영역에 배경 적용
  if (bgImage) {
    await new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => { ctx.drawImage(img, padH, padTop, sw, sh); resolve() }
      img.onerror = resolve
      img.src = bgImage
    })
  } else if (bgColor) {
    ctx.fillStyle = bgColor
    ctx.fillRect(padH, padTop, sw, sh)
  }

  // 캐릭터/의상 레이어 합성
  ctx.shadowColor   = 'rgba(0,0,0,0.12)'
  ctx.shadowBlur    = 20
  ctx.shadowOffsetY = 4
  ctx.drawImage(captured, padH, padTop, sw, sh)
  ctx.shadowColor = 'transparent'

  const centerX = cardW / 2
  const textY   = sh + padTop + padBot * 0.45
  ctx.textAlign  = 'center'
  ctx.fillStyle  = '#222'
  ctx.font       = `bold ${Math.round(padBot * 0.28)}px "Apple SD Gothic Neo", "Noto Sans KR", sans-serif`
  ctx.fillText('2026 닛몰캐쉬 생일축하해!', centerX, textY)

  return canvas.toDataURL('image/png')
}

export function downloadPhotoCard(dataUrl) {
  const link = document.createElement('a')
  link.download = `nmc-photocard-${Date.now()}.png`
  link.href = dataUrl
  link.click()
}
