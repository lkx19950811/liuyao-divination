import { ref, computed } from 'vue'
import { useDivinationStore } from '../stores/divination'
import type { DivinationResult, YaoType } from '@shared/types'

export function useDivination() {
  const divinationStore = useDivinationStore()

  const currentMethod = ref<'time' | 'number' | 'coin' | 'manual'>('time')

  const question = ref('')
  const remark = ref('')

  // 时间起卦参数
  const year = ref(new Date().getFullYear())
  const month = ref(new Date().getMonth() + 1)
  const day = ref(new Date().getDate())
  const hour = ref(new Date().getHours())

  // 数字起卦参数
  const num1 = ref(0)
  const num2 = ref(0)

  // 手动起卦参数
  const yaos = ref<YaoType[]>(['yin', 'yin', 'yin', 'yin', 'yin', 'yin'])

  const hasResult = computed(() => divinationStore.hasResult)

  function setMethod(method: 'time' | 'number' | 'coin' | 'manual') {
    currentMethod.value = method
  }

  function setQuestion(value: string) {
    question.value = value
  }

  function setRemark(value: string) {
    remark.value = value
  }

  async function performDivination() {
    let result: DivinationResult

    switch (currentMethod.value) {
      case 'time':
        result = await divinationStore.timeDivination(
          year.value,
          month.value,
          day.value,
          hour.value,
          question.value || undefined
        )
        break

      case 'number':
        result = await divinationStore.numberDivination(
          num1.value || 1,
          num2.value || 1,
          question.value || undefined
        )
        break

      case 'coin':
        result = await divinationStore.coinDivination(question.value || undefined)
        break

      case 'manual':
        result = await divinationStore.manualDivination(yaos.value, question.value || undefined)
        break
    }

    // 添加备注
    if (remark.value) {
      result.remark = remark.value
    }

    // 根据设置决定是否自动保存
    // if (settingsStore.autoSave) {
    //   await divinationStore.saveResult(result)
    // }

    return result
  }

  function resetForm() {
    question.value = ''
    remark.value = ''
    yaos.value = ['yin', 'yin', 'yin', 'yin', 'yin', 'yin']

    year.value = new Date().getFullYear()
    month.value = new Date().getMonth() + 1
    day.value = new Date().getDate()
    hour.value = new Date().getHours()
  }

  function getCurrentResult(): DivinationResult | null {
    return divinationStore.currentResult
  }

  function clearResult() {
    divinationStore.clearResult()
  }

  return {
    currentMethod,
    question,
    remark,
    year,
    month,
    day,
    hour,
    num1,
    num2,
    yaos,
    hasResult,
    setMethod,
    setQuestion,
    setRemark,
    performDivination,
    resetForm,
    getCurrentResult,
    clearResult
  }
}
