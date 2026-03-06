/**
 * 壁纸生成服务
 * 根据卦象生成精美壁纸
 */

export interface WallpaperStyle {
  id: string
  name: string
  background: string
  textColor: string
  fontFamily: string
  decorationStyle: 'classic' | 'modern' | 'minimal'
}

// 预设风格
export const WALLPAPER_STYLES: WallpaperStyle[] = [
  {
    id: 'classic',
    name: '古典风格',
    background: '#f5f0e6',
    textColor: '#4a3728',
    fontFamily: 'serif',
    decorationStyle: 'classic'
  },
  {
    id: 'modern',
    name: '现代风格',
    background: '#1a1a2e',
    textColor: '#eaeaea',
    fontFamily: 'sans-serif',
    decorationStyle: 'modern'
  },
  {
    id: 'minimal',
    name: '简约风格',
    background: '#ffffff',
    textColor: '#333333',
    fontFamily: 'sans-serif',
    decorationStyle: 'minimal'
  },
  {
    id: 'ink',
    name: '水墨风格',
    background: '#f8f8f8',
    textColor: '#1a1a1a',
    fontFamily: 'serif',
    decorationStyle: 'classic'
  }
]

// 吉卦列表
const LUCKY_HEXAGRAMS = ['乾', '泰', '否', '谦', '豫', '复', '无妄', '咸', '恒', '益', '升', '鼎', '震', '丰', '既济']

export class WallpaperService {
  /**
   * 生成壁纸
   */
  async generate(
    hexagram: {
      name: string
      description: string | null
      guaci: string
    },
    style: WallpaperStyle
  ): Promise<Blob> {
    const canvas = document.createElement('canvas')
    // 使用更合理的尺寸 (9:16 比例，适合手机壁纸)
    canvas.width = 720
    canvas.height = 1280
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('无法创建 Canvas 上下文')
    }

    // 绘制背景
    this.drawBackground(ctx, canvas.width, canvas.height, style)

    // 绘制装饰
    this.drawDecoration(ctx, canvas.width, canvas.height, style)

    // 绘制卦象符号
    this.drawHexagramSymbol(ctx, hexagram.name, canvas.width, canvas.height, style)

    // 绘制卦名
    this.drawHexagramName(ctx, hexagram.name, canvas.width, canvas.height, style)

    // 绘制卦辞
    this.drawGuaci(ctx, hexagram.guaci, canvas.width, canvas.height, style)

    // 绘制签文
    this.drawFortuneText(ctx, hexagram.name, canvas.width, canvas.height, style)

    // 转换为 Blob
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Canvas 转 Blob 失败'))
        }
      }, 'image/png')
    })
  }

  /**
   * 绘制背景
   */
  private drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number, style: WallpaperStyle) {
    if (style.decorationStyle === 'classic') {
      // 古典风格：渐变 + 纹理
      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, style.background)
      gradient.addColorStop(1, this.adjustColor(style.background, -20))
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      // 添加纹理
      ctx.globalAlpha = 0.03
      for (let i = 0; i < 50; i++) {
        ctx.beginPath()
        ctx.arc(
          Math.random() * width,
          Math.random() * height,
          Math.random() * 100 + 50,
          0,
          Math.PI * 2
        )
        ctx.fillStyle = '#8b4513'
        ctx.fill()
      }
      ctx.globalAlpha = 1
    } else if (style.decorationStyle === 'modern') {
      // 现代风格：纯色 + 光晕
      ctx.fillStyle = style.background
      ctx.fillRect(0, 0, width, height)

      // 光晕效果
      const gradient = ctx.createRadialGradient(width / 2, height / 3, 0, width / 2, height / 3, 400)
      gradient.addColorStop(0, 'rgba(100, 149, 237, 0.3)')
      gradient.addColorStop(1, 'rgba(100, 149, 237, 0)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
    } else {
      // 简约风格：纯色
      ctx.fillStyle = style.background
      ctx.fillRect(0, 0, width, height)
    }
  }

  /**
   * 绘制装饰
   */
  private drawDecoration(ctx: CanvasRenderingContext2D, width: number, height: number, style: WallpaperStyle) {
    ctx.strokeStyle = style.textColor
    ctx.globalAlpha = 0.2

    if (style.decorationStyle === 'classic') {
      // 古典边框
      ctx.lineWidth = 2
      ctx.strokeRect(50, 50, width - 100, height - 100)

      // 角落装饰
      const cornerSize = 40
      ctx.lineWidth = 3

      // 左上角
      ctx.beginPath()
      ctx.moveTo(50, 50 + cornerSize)
      ctx.lineTo(50, 50)
      ctx.lineTo(50 + cornerSize, 50)
      ctx.stroke()

      // 右上角
      ctx.beginPath()
      ctx.moveTo(width - 50 - cornerSize, 50)
      ctx.lineTo(width - 50, 50)
      ctx.lineTo(width - 50, 50 + cornerSize)
      ctx.stroke()

      // 左下角
      ctx.beginPath()
      ctx.moveTo(50, height - 50 - cornerSize)
      ctx.lineTo(50, height - 50)
      ctx.lineTo(50 + cornerSize, height - 50)
      ctx.stroke()

      // 右下角
      ctx.beginPath()
      ctx.moveTo(width - 50 - cornerSize, height - 50)
      ctx.lineTo(width - 50, height - 50)
      ctx.lineTo(width - 50, height - 50 - cornerSize)
      ctx.stroke()
    } else if (style.decorationStyle === 'modern') {
      // 现代几何装饰
      ctx.lineWidth = 1

      // 圆形
      ctx.beginPath()
      ctx.arc(width / 2, height / 2.5, 300, 0, Math.PI * 2)
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(width / 2, height / 2.5, 320, 0, Math.PI * 2)
      ctx.stroke()
    }

    ctx.globalAlpha = 1
  }

  /**
   * 绘制卦象符号
   */
  private drawHexagramSymbol(ctx: CanvasRenderingContext2D, name: string, width: number, height: number, style: WallpaperStyle) {
    // 太极图或八卦符号
    const centerX = width / 2
    const centerY = height / 2.5
    const radius = 120

    ctx.save()

    if (style.decorationStyle === 'classic') {
      // 绘制简化太极图
      this.drawTaiji(ctx, centerX, centerY, radius, style)
    } else if (style.decorationStyle === 'modern') {
      // 现代风格：卦名大字
      ctx.font = `bold ${radius}px ${style.fontFamily}`
      ctx.fillStyle = style.textColor
      ctx.globalAlpha = 0.1
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(name, centerX, centerY)
      ctx.globalAlpha = 1
    }

    ctx.restore()
  }

  /**
   * 绘制太极图
   */
  private drawTaiji(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, style: WallpaperStyle) {
    ctx.save()
    ctx.globalAlpha = 0.3

    // 外圆
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.strokeStyle = style.textColor
    ctx.lineWidth = 2
    ctx.stroke()

    // 太极阴阳
    ctx.beginPath()
    ctx.arc(x, y, radius, Math.PI / 2, Math.PI * 3 / 2)
    ctx.fillStyle = style.textColor
    ctx.fill()

    ctx.beginPath()
    ctx.arc(x, y - radius / 2, radius / 2, Math.PI / 2, Math.PI * 3 / 2)
    ctx.fillStyle = style.background
    ctx.fill()

    ctx.beginPath()
    ctx.arc(x, y + radius / 2, radius / 2, -Math.PI / 2, Math.PI / 2)
    ctx.fillStyle = style.textColor
    ctx.fill()

    // 小圆点
    ctx.beginPath()
    ctx.arc(x, y - radius / 2, radius / 8, 0, Math.PI * 2)
    ctx.fillStyle = style.textColor
    ctx.fill()

    ctx.beginPath()
    ctx.arc(x, y + radius / 2, radius / 8, 0, Math.PI * 2)
    ctx.fillStyle = style.background
    ctx.fill()

    ctx.restore()
  }

  /**
   * 绘制卦名
   */
  private drawHexagramName(ctx: CanvasRenderingContext2D, name: string, width: number, height: number, style: WallpaperStyle) {
    ctx.save()

    ctx.font = `bold 80px ${style.fontFamily}`
    ctx.fillStyle = style.textColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // 阴影效果
    if (style.decorationStyle !== 'minimal') {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
      ctx.shadowBlur = 10
      ctx.shadowOffsetX = 3
      ctx.shadowOffsetY = 3
    }

    ctx.fillText(name, width / 2, height / 2 + 50)

    ctx.restore()
  }

  /**
   * 绘制卦辞
   */
  private drawGuaci(ctx: CanvasRenderingContext2D, guaci: string, width: number, height: number, style: WallpaperStyle) {
    ctx.save()

    const maxWidth = width - 150
    ctx.font = `24px ${style.fontFamily}`
    ctx.fillStyle = style.textColor
    ctx.globalAlpha = 0.8
    ctx.textAlign = 'center'

    // 自动换行
    const lines = this.wrapText(ctx, guaci, maxWidth)
    const lineHeight = 36
    const startY = height / 2 + 150

    lines.forEach((line, index) => {
      ctx.fillText(line, width / 2, startY + index * lineHeight)
    })

    ctx.restore()
  }

  /**
   * 绘制签文
   */
  private drawFortuneText(ctx: CanvasRenderingContext2D, hexagramName: string, width: number, height: number, style: WallpaperStyle) {
    const isLucky = LUCKY_HEXAGRAMS.includes(hexagramName)
    const fortuneText = isLucky ? '上上签 · 吉' : '中签 · 平'

    ctx.save()

    ctx.font = `18px ${style.fontFamily}`
    ctx.fillStyle = style.textColor
    ctx.globalAlpha = 0.6
    ctx.textAlign = 'center'

    ctx.fillText(fortuneText, width / 2, height - 200)

    // 日期
    const date = new Date()
    const dateStr = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
    ctx.font = `14px ${style.fontFamily}`
    ctx.fillText(dateStr, width / 2, height - 170)

    // 底部文字
    ctx.font = `12px ${style.fontFamily}`
    ctx.fillText('六爻预测', width / 2, height - 100)

    ctx.restore()
  }

  /**
   * 文本换行
   */
  private wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const lines: string[] = []
    let currentLine = ''

    for (const char of text) {
      const testLine = currentLine + char
      const metrics = ctx.measureText(testLine)

      if (metrics.width > maxWidth && currentLine.length > 0) {
        lines.push(currentLine)
        currentLine = char
      } else {
        currentLine = testLine
      }
    }

    if (currentLine) {
      lines.push(currentLine)
    }

    return lines
  }

  /**
   * 调整颜色亮度
   */
  private adjustColor(color: string, amount: number): string {
    const hex = color.replace('#', '')
    const r = Math.max(0, Math.min(255, parseInt(hex.slice(0, 2), 16) + amount))
    const g = Math.max(0, Math.min(255, parseInt(hex.slice(2, 4), 16) + amount))
    const b = Math.max(0, Math.min(255, parseInt(hex.slice(4, 6), 16) + amount))

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }

  /**
   * 保存壁纸
   */
  async save(blob: Blob, filename: string): Promise<string> {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename

    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    URL.revokeObjectURL(url)

    return filename
  }

  /**
   * 获取预设风格
   */
  getPresetStyles(): WallpaperStyle[] {
    return WALLPAPER_STYLES
  }

  /**
   * 检查是否为吉卦
   */
  isLuckyHexagram(name: string): boolean {
    return LUCKY_HEXAGRAMS.includes(name)
  }
}

// 导出单例
export const wallpaperService = new WallpaperService()