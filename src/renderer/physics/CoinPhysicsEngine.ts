import Matter from 'matter-js'
import type { CoinPhysicsOptions, CoinState, ShakeMetadata, TossResult, PhysicsEvent, PhysicsEventDataMap } from './types'

// 调试模式
const DEBUG = true

// 铜钱状态
interface Coin3DState {
  x: number
  y: number
  z: number // 高度（模拟）
  vx: number
  vy: number
  vz: number
  rotationX: number // 3D旋转
  rotationY: number
  angularVelocityX: number
  angularVelocityY: number
  isHeads: boolean
  isStable: boolean
}

export class CoinPhysicsEngine {
  private engine: Matter.Engine | null = null
  private runner: Matter.Runner | null = null
  private world: Matter.World | null = null
  private coins2D: Matter.Body[] = [] // 2D物理体
  private coins3D: Coin3DState[] = [] // 3D状态
  private eventListeners: Map<PhysicsEvent, Set<Function>> = new Map()
  private shakeMetadata: ShakeMetadata[] = []
  private shakeStartTime: number = 0
  private isShaking: boolean = false
  private stabilityCheckInterval: number | null = null
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private animationFrame: number | null = null
  private logCallback?: (msg: string) => void

  constructor(private options: CoinPhysicsOptions, logCallback?: (msg: string) => void) {
    this.logCallback = logCallback
  }

  private log(msg: string): void {
    console.log(msg)
    if (this.logCallback) {
      this.logCallback(msg)
    }
    // 同时保存到 localStorage 以便外部读取
    const logs = JSON.parse(localStorage.getItem('physics_logs') || '[]')
    logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`)
    if (logs.length > 50) logs.shift()
    localStorage.setItem('physics_logs', JSON.stringify(logs))
  }

  init(canvas: HTMLCanvasElement): void {
    // 防止重复初始化
    if (this.engine) {
      this.log('[Physics] Already initialized, skipping...')
      return
    }

    this.log('[Physics] Initializing...')
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')

    if (!this.ctx) {
      this.log('[Physics] Failed to get canvas context')
      return
    }

    // 设置 canvas 尺寸
    const dpr = window.devicePixelRatio || 1
    canvas.width = this.options.containerWidth * dpr
    canvas.height = this.options.containerHeight * dpr
    canvas.style.width = `${this.options.containerWidth}px`
    canvas.style.height = `${this.options.containerHeight}px`
    if (this.ctx) {
      this.ctx.scale(dpr, dpr)
    }

    this.log(`[Physics] Canvas size: ${this.options.containerWidth} x ${this.options.containerHeight}`)

    // 创建2D物理引擎（用于XY平面运动）
    this.engine = Matter.Engine.create({
      gravity: { x: 0, y: 0.5 } // 恢复重力，让钱币能下落
    })
    this.world = this.engine.world

    // 创建边界
    this.createContainer()

    // 创建铜钱
    this.createCoins()

    this.log(`[Physics] Created ${this.coins2D.length} coins`)
    if (this.logCallback) {
      this.logCallback(`[Physics] Created ${this.coins2D.length} coins`)
    }

    // 启动物理引擎
    this.runner = Matter.Runner.create({
      isFixed: false,
      delta: 1000 / 60
    })
    Matter.Runner.run(this.runner, this.engine)

    // 启动渲染循环
    this.startRenderLoop()
    this.log('[Physics] Initialization complete')
    if (this.logCallback) {
      this.logCallback('[Physics] Initialization complete!')
    }
  }

  private createContainer(): void {
    if (!this.world) return

    const { containerWidth, containerHeight } = this.options
    const padding = 30

    const wallOptions = {
      isStatic: true,
      render: { visible: false },
      friction: 0.1,
      restitution: 0.5
    }

    // 简化的矩形边界 - 给硬币更多空间，避免卡在底部
    const margin = 50  // 增加边距
    const wallThickness = 20

    // 上边界
    const topWall = Matter.Bodies.rectangle(
      containerWidth / 2, -wallThickness / 2,
      containerWidth + 100, wallThickness,
      wallOptions
    )
    // 下边界 - 放到 canvas 外面一点，给硬币更多空间
    const bottomWall = Matter.Bodies.rectangle(
      containerWidth / 2, containerHeight + wallThickness / 2 - 10,
      containerWidth + 100, wallThickness,
      wallOptions
    )
    // 左边界
    const leftWall = Matter.Bodies.rectangle(
      -wallThickness / 2, containerHeight / 2,
      wallThickness, containerHeight + 100,
      wallOptions
    )
    // 右边界
    const rightWall = Matter.Bodies.rectangle(
      containerWidth + wallThickness / 2, containerHeight / 2,
      wallThickness, containerHeight + 100,
      wallOptions
    )

    Matter.World.add(this.world, [topWall, bottomWall, leftWall, rightWall])
  }

  private createCoins(): void {
    if (!this.world) {
      this.log('[Physics] ERROR: world is null!')
      return
    }

    this.log('[Physics] Creating coins...')

    const { containerWidth, containerHeight, coinRadius } = this.options
    const centerX = containerWidth / 2
    const centerY = containerHeight / 2

    // 清除现有铜钱
    if (this.coins2D.length > 0) {
      Matter.World.remove(this.world, this.coins2D)
      this.coins2D = []
    }
    this.coins3D = []

    // 创建三枚铜钱 - 水平排列在碗中心
    for (let i = 0; i < 3; i++) {
      // 2D物理体 - 水平排列，Y坐标相同
      const coin2D = Matter.Bodies.circle(
        centerX + (i - 1) * coinRadius * 2.2,
        centerY,
        coinRadius,
        {
          restitution: 0.6,
          friction: 0.1,
          frictionAir: 0.02,
          density: 0.002,
          label: `coin_${i}`
        }
      )

      this.coins2D.push(coin2D)
      Matter.World.add(this.world, coin2D)

      // 3D状态
      this.coins3D.push({
        x: coin2D.position.x,
        y: coin2D.position.y,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        rotationX: Math.random() * Math.PI * 2, // 随机初始角度
        rotationY: 0,
        angularVelocityX: 0,
        angularVelocityY: 0,
        isHeads: true,
        isStable: true
      })
    }

    this.log(`[Physics] Created ${this.coins3D.length} coins in 3D array`)
  }

  private startRenderLoop(): void {
    this.log('[Physics] Starting render loop')
    if (this.logCallback) {
      this.logCallback('[Physics] Render loop started')
    }
    let frameCount = 0
    let lastZ = 0
    const render = () => {
      frameCount++

      // 每30帧输出一次，或者当Z轴有显著变化时
      if (frameCount % 30 === 0) {
        const coin3D = this.coins3D[0]
        if (coin3D) {
          const zChanged = Math.abs(coin3D.z - lastZ) > 1
          if (zChanged || coin3D.z > 5) {
            const msg = `[Physics] Frame ${frameCount} z:${coin3D.z.toFixed(0)} vz:${coin3D.vz.toFixed(1)} stable:${coin3D.isStable}`
            if (this.logCallback && DEBUG) {
              this.logCallback(msg)
            }
            lastZ = coin3D.z
          }
        }
      }
      this.update3D()
      this.renderFrame()
      this.animationFrame = requestAnimationFrame(render)
    }
    render()
  }

  private update3D(): void {
    // 同步2D物理到3D状态
    this.coins2D.forEach((coin2D, i) => {
      const coin3D = this.coins3D[i]

      // XY位置同步
      coin3D.x = coin2D.position.x
      coin3D.y = coin2D.position.y

      // 速度
      coin3D.vx = coin2D.velocity.x
      coin3D.vy = coin2D.velocity.y

      // Z轴物理模拟
      if (coin3D.z > 0 || Math.abs(coin3D.vz) > 0.1) {
        // Z轴重力 - 减小重力让动画更持久
        coin3D.vz -= 0.5
        coin3D.z += coin3D.vz

        if (coin3D.z < 0) {
          coin3D.z = 0
          coin3D.vz = -coin3D.vz * 0.5 // 弹跳衰减
          if (Math.abs(coin3D.vz) < 0.5) coin3D.vz = 0
        }
      }

      // 3D旋转
      const speed = Math.sqrt(coin3D.vx ** 2 + coin3D.vy ** 2)
      if (speed > 0.1) {
        coin3D.angularVelocityX = coin2D.angularVelocity * 2
      } else {
        coin3D.angularVelocityX *= 0.95 // 阻尼
      }

      coin3D.rotationX += coin3D.angularVelocityX

      // 判断正反面
      coin3D.isHeads = Math.sin(coin3D.rotationX) > 0

      // 判断稳定性
      coin3D.isStable = coin3D.z < 0.1 &&
                       Math.abs(coin3D.vz) < 0.1 &&
                       Math.abs(coin3D.vx) < 0.1 &&
                       Math.abs(coin3D.vy) < 0.1 &&
                       Math.abs(coin3D.angularVelocityX) < 0.02
    })
  }

  private renderFrame(): void {
    if (!this.ctx || !this.canvas) {
      this.log('[Physics] ERROR: ctx or canvas is null!')
      return
    }

    const { containerWidth, containerHeight } = this.options

    // 清空画布
    this.ctx.clearRect(0, 0, containerWidth, containerHeight)

    // 绘制背景 - 碗底效果
    this.drawBowlBackground()

    // 调试：绘制中心点
    this.ctx.fillStyle = 'red'
    this.ctx.beginPath()
    this.ctx.arc(containerWidth/2, containerHeight/2, 3, 0, Math.PI*2)
    this.ctx.fill()

    // 调试：显示硬币数量
    this.ctx.fillStyle = 'lime'
    this.ctx.font = '14px monospace'
    this.ctx.textAlign = 'left'
    this.ctx.fillText(`Coins: ${this.coins3D.length}`, 10, 40)

    // 按Z轴排序绘制铜钱（远的先画）
    if (this.coins3D.length > 0) {
      const sortedCoins = [...this.coins3D].sort((a, b) => a.z - b.z)
      sortedCoins.forEach((coin) => {
        this.drawCoin(coin)
      })
    }

    // 绘制碗边
    this.drawBowlRim()

    // 调试：在角落显示第一枚硬币的Z值
    this.ctx.fillStyle = 'white'
    this.ctx.font = '12px monospace'
    this.ctx.textAlign = 'left'
    const coin0 = this.coins3D[0]
    if (coin0) {
      this.ctx.fillText(`Z: ${coin0.z.toFixed(0)}`, 10, 20)
    }
  }

  private drawBowlBackground(): void {
    if (!this.ctx) return

    const { containerWidth, containerHeight } = this.options
    const centerX = containerWidth / 2
    const centerY = containerHeight / 2
    const radius = Math.min(containerWidth, containerHeight) / 2 - 25

    this.ctx.save()

    const bowlGradient = this.ctx.createRadialGradient(
      centerX - radius * 0.2, centerY - radius * 0.2, 0,
      centerX, centerY, radius
    )
    bowlGradient.addColorStop(0, '#4a3728')
    bowlGradient.addColorStop(0.3, '#3d2e22')
    bowlGradient.addColorStop(0.6, '#2a1f18')
    bowlGradient.addColorStop(0.85, '#1a1410')
    bowlGradient.addColorStop(1, '#0d0a08')

    this.ctx.beginPath()
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    this.ctx.fillStyle = bowlGradient
    this.ctx.fill()

    const innerShadow = this.ctx.createRadialGradient(
      centerX, centerY, radius * 0.3,
      centerX, centerY, radius
    )
    innerShadow.addColorStop(0, 'rgba(0, 0, 0, 0)')
    innerShadow.addColorStop(0.5, 'rgba(0, 0, 0, 0.2)')
    innerShadow.addColorStop(0.8, 'rgba(0, 0, 0, 0.4)')
    innerShadow.addColorStop(1, 'rgba(0, 0, 0, 0.7)')

    this.ctx.beginPath()
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    this.ctx.fillStyle = innerShadow
    this.ctx.fill()

    this.ctx.strokeStyle = 'rgba(139, 90, 43, 0.15)'
    this.ctx.lineWidth = 1
    for (let r = 40; r < radius - 10; r += 25) {
      this.ctx.beginPath()
      this.ctx.arc(centerX, centerY, r, 0, Math.PI * 2)
      this.ctx.stroke()
    }

    const highlightGradient = this.ctx.createRadialGradient(
      centerX - radius * 0.4, centerY - radius * 0.4, 0,
      centerX - radius * 0.4, centerY - radius * 0.4, radius * 0.5
    )
    highlightGradient.addColorStop(0, 'rgba(255, 220, 180, 0.08)')
    highlightGradient.addColorStop(1, 'rgba(255, 220, 180, 0)')

    this.ctx.beginPath()
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    this.ctx.fillStyle = highlightGradient
    this.ctx.fill()

    this.ctx.restore()
  }

  private drawBowlRim(): void {
    if (!this.ctx) return

    const { containerWidth, containerHeight } = this.options
    const centerX = containerWidth / 2
    const centerY = containerHeight / 2
    const radius = Math.min(containerWidth, containerHeight) / 2 - 25
    const rimWidth = 12

    this.ctx.save()

    for (let i = 0; i < rimWidth; i++) {
      const r = radius + i
      const alpha = 1 - (i / rimWidth) * 0.7
      const brightness = 60 - i * 2
      
      this.ctx.beginPath()
      this.ctx.arc(centerX, centerY, r, 0, Math.PI * 2)
      this.ctx.strokeStyle = `rgba(${brightness + 40}, ${brightness + 20}, ${brightness}, ${alpha})`
      this.ctx.lineWidth = 1.5
      this.ctx.stroke()
    }

    const rimGradient = this.ctx.createLinearGradient(
      centerX - radius, centerY - radius,
      centerX + radius, centerY + radius
    )
    rimGradient.addColorStop(0, 'rgba(255, 215, 150, 0.3)')
    rimGradient.addColorStop(0.3, 'rgba(255, 200, 120, 0.1)')
    rimGradient.addColorStop(0.5, 'rgba(255, 220, 160, 0.2)')
    rimGradient.addColorStop(0.7, 'rgba(200, 150, 80, 0.1)')
    rimGradient.addColorStop(1, 'rgba(180, 120, 60, 0.15)')

    this.ctx.beginPath()
    this.ctx.arc(centerX, centerY, radius + rimWidth / 2, 0, Math.PI * 2)
    this.ctx.strokeStyle = rimGradient
    this.ctx.lineWidth = rimWidth
    this.ctx.stroke()

    this.ctx.beginPath()
    this.ctx.arc(centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.15, 0, Math.PI * 2)
    const spotGradient = this.ctx.createRadialGradient(
      centerX - radius * 0.3, centerY - radius * 0.3, 0,
      centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.15
    )
    spotGradient.addColorStop(0, 'rgba(255, 230, 200, 0.15)')
    spotGradient.addColorStop(1, 'rgba(255, 230, 200, 0)')
    this.ctx.fillStyle = spotGradient
    this.ctx.fill()

    this.ctx.restore()
  }

  private drawCoin(coin: Coin3DState): void {
    if (!this.ctx) return

    const { coinRadius } = this.options
    const x = coin.x
    const y = coin.y
    const z = coin.z
    const thickness = coinRadius * 0.18

    // 增强透视效果 - Z轴高度对大小的影响更明显
    const perspectiveScale = 1 + z * 0.015

    // Z轴高度对Y位置的影响 - 让硬币看起来跳得更高
    const visualYOffset = -z * 0.8

    const flipAngle = coin.rotationX % (Math.PI * 2)
    const scaleX = Math.cos(flipAngle)
    const absScaleX = Math.abs(scaleX)

    const showHeads = scaleX > 0 ? coin.isHeads : !coin.isHeads

    this.ctx.save()
    this.ctx.translate(x, y + visualYOffset)

    // 阴影 - 随高度变化
    this.ctx.save()
    this.ctx.translate(z * 0.3, -visualYOffset + thickness * 0.3)
    const shadowScale = 1 - Math.min(z / 200, 0.5)
    const shadowAlpha = Math.max(0.1, 0.4 - z * 0.002)
    this.ctx.beginPath()
    this.ctx.ellipse(0, 0, coinRadius * shadowScale, coinRadius * shadowScale * 0.6, 0, 0, Math.PI * 2)
    this.ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`
    this.ctx.fill()
    this.ctx.restore()

    const effectiveThickness = thickness * absScaleX

    if (absScaleX > 0.15 && absScaleX < 0.95) {
      this.ctx.save()
      this.ctx.scale(absScaleX, 1)

      const edgeHeight = effectiveThickness * 2

      // 绘制硬币边缘厚度 - 使用矩形模拟圆柱侧面
      const edgeGradient = this.ctx.createLinearGradient(0, -edgeHeight, 0, edgeHeight)

      if (showHeads) {
        edgeGradient.addColorStop(0, '#DAA520')
        edgeGradient.addColorStop(0.2, '#FFD700')
        edgeGradient.addColorStop(0.4, '#B8860B')
        edgeGradient.addColorStop(0.5, '#8B6914')
        edgeGradient.addColorStop(0.6, '#B8860B')
        edgeGradient.addColorStop(0.8, '#FFD700')
        edgeGradient.addColorStop(1, '#DAA520')
      } else {
        edgeGradient.addColorStop(0, '#A8A8A8')
        edgeGradient.addColorStop(0.2, '#D0D0D0')
        edgeGradient.addColorStop(0.4, '#909090')
        edgeGradient.addColorStop(0.5, '#707070')
        edgeGradient.addColorStop(0.6, '#909090')
        edgeGradient.addColorStop(0.8, '#D0D0D0')
        edgeGradient.addColorStop(1, '#A8A8A8')
      }

      // 绘制边缘厚度 - 使用椭圆环形状
      this.ctx.fillStyle = edgeGradient
      this.ctx.beginPath()
      // 外椭圆（上半部分）
      this.ctx.ellipse(0, 0, coinRadius, coinRadius, 0, Math.PI, 0)
      // 内椭圆（下半部分，稍微小一点来模拟厚度）
      this.ctx.ellipse(0, edgeHeight * 0.5, coinRadius * 0.95, coinRadius * 0.95, 0, 0, Math.PI)
      this.ctx.closePath()
      this.ctx.fill()

      // 绘制边缘描边
      this.ctx.strokeStyle = showHeads ? '#6B4E0A' : '#505050'
      this.ctx.lineWidth = 0.5
      this.ctx.beginPath()
      this.ctx.ellipse(0, 0, coinRadius, coinRadius, 0, 0, Math.PI * 2)
      this.ctx.stroke()

      this.ctx.restore()
    }

    this.ctx.save()
    this.ctx.scale(absScaleX * perspectiveScale, perspectiveScale)

    const coinGradient = this.ctx.createRadialGradient(
      -coinRadius * 0.35, -coinRadius * 0.35, 0,
      0, 0, coinRadius
    )
    if (showHeads) {
      coinGradient.addColorStop(0, '#FFFEF0')
      coinGradient.addColorStop(0.15, '#FFE566')
      coinGradient.addColorStop(0.4, '#FFD700')
      coinGradient.addColorStop(0.65, '#DAA520')
      coinGradient.addColorStop(0.85, '#B8860B')
      coinGradient.addColorStop(1, '#8B6914')
    } else {
      coinGradient.addColorStop(0, '#FAFAFA')
      coinGradient.addColorStop(0.15, '#E8E8E8')
      coinGradient.addColorStop(0.4, '#C8C8C8')
      coinGradient.addColorStop(0.65, '#A0A0A0')
      coinGradient.addColorStop(0.85, '#808080')
      coinGradient.addColorStop(1, '#606060')
    }

    this.ctx.beginPath()
    this.ctx.arc(0, 0, coinRadius, 0, Math.PI * 2)
    this.ctx.fillStyle = coinGradient
    this.ctx.fill()

    this.ctx.beginPath()
    this.ctx.arc(0, 0, coinRadius - 0.5, 0, Math.PI * 2)
    this.ctx.strokeStyle = showHeads ? 'rgba(107, 78, 10, 0.6)' : 'rgba(60, 60, 60, 0.6)'
    this.ctx.lineWidth = 2.5
    this.ctx.stroke()

    this.ctx.beginPath()
    this.ctx.arc(0, 0, coinRadius * 0.8, 0, Math.PI * 2)
    this.ctx.strokeStyle = showHeads ? 'rgba(139, 105, 20, 0.35)' : 'rgba(100, 100, 100, 0.35)'
    this.ctx.lineWidth = 1.5
    this.ctx.stroke()

    this.ctx.beginPath()
    this.ctx.arc(0, 0, coinRadius * 0.68, 0, Math.PI * 2)
    this.ctx.strokeStyle = showHeads ? 'rgba(139, 105, 20, 0.2)' : 'rgba(120, 120, 120, 0.2)'
    this.ctx.lineWidth = 1
    this.ctx.stroke()

    const holeSize = coinRadius * 0.14
    this.ctx.save()
    this.ctx.beginPath()
    this.ctx.rect(-holeSize - 2, -holeSize - 2, holeSize * 2 + 4, holeSize * 2 + 4)
    this.ctx.clip()
    
    const holeGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, holeSize * 1.5)
    holeGradient.addColorStop(0, '#050505')
    holeGradient.addColorStop(0.5, '#0a0a0a')
    holeGradient.addColorStop(0.8, '#151515')
    holeGradient.addColorStop(1, '#202020')
    
    this.ctx.fillStyle = holeGradient
    this.ctx.fillRect(-holeSize, -holeSize, holeSize * 2, holeSize * 2)
    this.ctx.restore()
    
    this.ctx.strokeStyle = showHeads ? '#6B4E0A' : '#404040'
    this.ctx.lineWidth = 1.5
    this.ctx.strokeRect(-holeSize, -holeSize, holeSize * 2, holeSize * 2)

    if (absScaleX > 0.35) {
      this.ctx.save()
      this.ctx.fillStyle = showHeads ? '#6B4E0A' : '#404040'
      this.ctx.font = `bold ${coinRadius * 0.38}px "KaiTi", "STKaiti", "SimSun", serif`
      this.ctx.textAlign = 'center'
      this.ctx.textBaseline = 'middle'
      
      this.ctx.shadowColor = showHeads ? 'rgba(255, 230, 150, 0.5)' : 'rgba(255, 255, 255, 0.3)'
      this.ctx.shadowBlur = 2
      this.ctx.shadowOffsetX = 0
      this.ctx.shadowOffsetY = 0
      
      this.ctx.fillText(showHeads ? '正' : '反', 0, 0)
      this.ctx.restore()
    }

    if (absScaleX > 0.5) {
      this.ctx.save()
      this.ctx.strokeStyle = showHeads ? 'rgba(255, 250, 220, 0.4)' : 'rgba(255, 255, 255, 0.25)'
      this.ctx.lineWidth = 2
      this.ctx.lineCap = 'round'
      this.ctx.beginPath()
      this.ctx.arc(-coinRadius * 0.35, -coinRadius * 0.35, coinRadius * 0.3, -0.8, 1.5)
      this.ctx.stroke()
      this.ctx.restore()
    }

    this.ctx.restore()

    if (coin.isStable && !this.isShaking) {
      this.ctx.save()
      
      const labelBg = showHeads ? 'rgba(139, 105, 20, 0.95)' : 'rgba(80, 80, 80, 0.95)'
      const labelWidth = 32
      const labelHeight = 22
      const labelY = y - coinRadius * perspectiveScale - 25
      
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.4)'
      this.ctx.shadowBlur = 6
      this.ctx.shadowOffsetX = 1
      this.ctx.shadowOffsetY = 3
      
      this.ctx.fillStyle = labelBg
      this.ctx.beginPath()
      this.roundRect(this.ctx, x - labelWidth/2, labelY, labelWidth, labelHeight, 6)
      this.ctx.fill()
      
      this.ctx.shadowColor = 'transparent'
      
      this.ctx.strokeStyle = showHeads ? 'rgba(255, 215, 0, 0.5)' : 'rgba(180, 180, 180, 0.5)'
      this.ctx.lineWidth = 1
      this.ctx.stroke()
      
      this.ctx.fillStyle = '#fff'
      this.ctx.font = 'bold 13px sans-serif'
      this.ctx.textAlign = 'center'
      this.ctx.textBaseline = 'middle'
      this.ctx.fillText(showHeads ? '正' : '反', x, labelY + labelHeight/2)
      
      this.ctx.restore()
    }
  }

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
  }

  toss(): void {
    this.log(`[Physics] ====== TOSS CALLED ======`)
    if (this.logCallback) {
      this.logCallback('[Physics] ====== TOSS STARTED ======')
    }

    const { containerWidth, containerHeight } = this.options
    const centerX = containerWidth / 2
    const centerY = containerHeight / 2

    this.log(`[Physics] Center: (${centerX}, ${centerY}), coins: ${this.coins2D.length}, coins3D: ${this.coins3D.length}`)

    // 重置所有铜钱的 3D 状态
    this.coins3D.forEach((coin3D, i) => {
      const coin2D = this.coins2D[i]
      if (!coin2D) {
        this.log(`[Physics] ERROR: coin2D[${i}] not found!`)
        return
      }

      // 将硬币重置到 canvas 中心区域上方
      const newX = centerX + (i - 1) * 40 + (Math.random() - 0.5) * 30
      const newY = centerY - 20 + (Math.random() - 0.5) * 20
      Matter.Body.setPosition(coin2D, { x: newX, y: newY })

      // 给硬币一个随机速度
      Matter.Body.setVelocity(coin2D, {
        x: (Math.random() - 0.5) * 8,
        y: (Math.random() - 0.5) * 4
      })

      // 随机旋转
      Matter.Body.setAngularVelocity(coin2D, (Math.random() - 0.5) * 0.6)

      // 重置 3D 状态 - 给一个很高的初始高度，确保动画明显
      coin3D.x = newX
      coin3D.y = newY
      coin3D.z = 100 + Math.random() * 50  // 初始高度
      coin3D.vx = coin2D.velocity.x
      coin3D.vy = coin2D.velocity.y
      coin3D.vz = 15 + Math.random() * 10  // 更大的向上的初速度
      coin3D.rotationX = Math.random() * Math.PI * 2
      coin3D.angularVelocityX = (Math.random() - 0.5) * 1.0
      coin3D.isStable = false

      const msg = `[Physics] Coin ${i} initialized at z:${coin3D.z.toFixed(0)} vz:${coin3D.vz.toFixed(1)}`
      this.log(msg)
      if (this.logCallback) {
        this.logCallback(msg)
      }
    })

    // 开始稳定性检查
    this.startStabilityCheck()
  }

  applyShake(force: { x: number; y: number }): void {
    if (!this.isShaking) {
      this.isShaking = true
      this.shakeStartTime = Date.now()
    }

    // 对2D物体施加力
    this.coins2D.forEach((coin2D) => {
      Matter.Body.applyForce(coin2D, coin2D.position, {
        x: force.x * 0.0008,
        y: force.y * 0.0008
      })

      // 随机旋转
      Matter.Body.setAngularVelocity(coin2D, coin2D.angularVelocity + (Math.random() - 0.5) * 0.5)
    })

    // 3D弹跳
    this.coins3D.forEach(coin3D => {
      coin3D.vz = Math.random() * 6 + 3
      coin3D.angularVelocityX = (Math.random() - 0.5) * 0.8
    })

    this.shakeMetadata.push({
      timestamp: Date.now(),
      force: { ...force },
      duration: Date.now() - this.shakeStartTime
    })
  }

  stopShake(): void {
    this.isShaking = false
    this.startStabilityCheck()
  }

  private startStabilityCheck(): void {
    if (this.stabilityCheckInterval) {
      clearInterval(this.stabilityCheckInterval)
    }

    this.stabilityCheckInterval = window.setInterval(() => {
      this.checkStability()
    }, 100)
  }

  private checkStability(): void {
    const allStable = this.coins3D.every(coin => coin.isStable)

    if (allStable) {
      if (this.stabilityCheckInterval) {
        clearInterval(this.stabilityCheckInterval)
        this.stabilityCheckInterval = null
      }

      const result = this.getTossResult()
      this.emit('allStable', { coins: this.getCoinStates() })
      this.emit('tossComplete', { result })
    }
  }

  getCoinStates(): CoinState[] {
    return this.coins3D.map((coin, i) => ({
      id: i,
      position: { x: coin.x, y: coin.y },
      rotation: coin.rotationX,
      isHeads: coin.isHeads,
      velocity: { x: coin.vx, y: coin.vy },
      angularVelocity: coin.angularVelocityX,
      isStable: coin.isStable
    }))
  }

  getTossResult(): TossResult {
    const coins = this.getCoinStates()
    const headsCount = coins.filter(c => c.isHeads).length

    let yaoType: 'yin' | 'yang' | 'oldYin' | 'oldYang'
    switch (headsCount) {
      case 3: yaoType = 'oldYang'; break
      case 2: yaoType = 'yang'; break
      case 1: yaoType = 'yin'; break
      case 0: yaoType = 'oldYin'; break
      default: yaoType = 'yang'
    }

    return {
      coins,
      yaoType,
      isStable: coins.every(c => c.isStable)
    }
  }

  getShakeMetadata(): ShakeMetadata[] {
    return [...this.shakeMetadata]
  }

  reset(): void {
    const { containerWidth, containerHeight, coinRadius } = this.options
    const centerX = containerWidth / 2
    const centerY = containerHeight / 2

    this.coins2D.forEach((coin2D, i) => {
      // 重置到中心上方位置
      Matter.Body.setPosition(coin2D, {
        x: centerX + (i - 1) * 30,
        y: centerY - 50
      })
      Matter.Body.setVelocity(coin2D, { x: 0, y: 0 })
      Matter.Body.setAngularVelocity(coin2D, 0)
    })

    this.coins3D.forEach((coin3D, i) => {
      coin3D.x = centerX + (i - 1) * 30
      coin3D.y = centerY - 50
      coin3D.z = 0
      coin3D.vx = 0
      coin3D.vy = 0
      coin3D.vz = 0
      coin3D.rotationX = Math.random() * Math.PI * 2
      coin3D.angularVelocityX = 0
      coin3D.isStable = true
    })

    this.shakeMetadata = []
    this.isShaking = false
    if (this.stabilityCheckInterval) {
      clearInterval(this.stabilityCheckInterval)
      this.stabilityCheckInterval = null
    }
  }

  on<K extends PhysicsEvent>(event: K, callback: (data: PhysicsEventDataMap[K]) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event)!.add(callback)
  }

  off<K extends PhysicsEvent>(event: K, callback: (data: PhysicsEventDataMap[K]) => void): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.delete(callback)
    }
  }

  private emit<K extends PhysicsEvent>(event: K, data: PhysicsEventDataMap[K]): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(callback => callback(data))
    }
  }

  destroy(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
    }
    if (this.stabilityCheckInterval) {
      clearInterval(this.stabilityCheckInterval)
    }
    if (this.runner) {
      Matter.Runner.stop(this.runner)
    }
    if (this.engine) {
      Matter.Engine.clear(this.engine)
    }
    this.eventListeners.clear()
    this.coins2D = []
    this.coins3D = []
  }
}