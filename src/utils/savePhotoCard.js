import html2canvas from 'html2canvas'

export async function savePhotoCard(stageEl, bgColor = '#ffffff') {
  // 스테이지 캡처
  const captured = await html2canvas(stageEl, {
    backgroundColor: bgColor,
    useCORS: true,
    scale: 2, // 고해상도
    logging: false,
  })

  const sw = captured.width
  const sh = captured.height

  // 포토카드 레이아웃 (폴라로이드 스타일)
  const padH = Math.round(sw * 0.06)   // 좌우 여백
  const padTop = Math.round(sw * 0.06) // 상단 여백
  const padBot = Math.round(sw * 0.22) // 하단 여백 (텍스트 공간)
  const cardW = sw + padH * 2
  const cardH = sh + padTop + padBot

  const canvas = document.createElement('canvas')
  canvas.width = cardW
  canvas.height = cardH
  const ctx = canvas.getContext('2d')

  // 카드 배경 (흰색)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, cardW, cardH)

  // 그림자 효과
  ctx.shadowColor = 'rgba(0,0,0,0.12)'
  ctx.shadowBlur = 20
  ctx.shadowOffsetY = 4

  // 스테이지 이미지 붙이기
  ctx.drawImage(captured, padH, padTop, sw, sh)
  ctx.shadowColor = 'transparent'

  // 하단 텍스트
  const centerX = cardW / 2
  const textY = sh + padTop + padBot * 0.45

  ctx.textAlign = 'center'
  ctx.fillStyle = '#222'
  ctx.font = `bold ${Math.round(padBot * 0.28)}px "Apple SD Gothic Neo", "Noto Sans KR", sans-serif`
  ctx.fillText('2026 닛몰캐쉬 생일축하해!', centerX, textY)

  // 다운로드
  const link = document.createElement('a')
  link.download = `nmc-photocard-${Date.now()}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}
