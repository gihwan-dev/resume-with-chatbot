/**
 * Request-level Cache
 * 에이전트 루프 내에서 동일한 API 호출 결과를 재사용하여 성능 최적화
 * 요청(채팅 1회) 단위로 생성/폐기되므로 메모리 누수 없음
 */

export class RequestCache {
  private cache = new Map<string, unknown>()

  /**
   * 캐시 키 생성
   */
  private createKey(toolName: string, params: Record<string, unknown>): string {
    return `${toolName}:${JSON.stringify(params)}`
  }

  /**
   * 캐시에서 결과 조회
   */
  get<T>(toolName: string, params: Record<string, unknown>): T | undefined {
    const key = this.createKey(toolName, params)
    return this.cache.get(key) as T | undefined
  }

  /**
   * 결과를 캐시에 저장
   */
  set<T>(toolName: string, params: Record<string, unknown>, result: T): void {
    const key = this.createKey(toolName, params)
    this.cache.set(key, result)
  }

  /**
   * 캐시된 결과가 있으면 반환, 없으면 fn 실행 후 캐시
   */
  async getOrFetch<T>(
    toolName: string,
    params: Record<string, unknown>,
    fn: () => Promise<T>
  ): Promise<T> {
    const cached = this.get<T>(toolName, params)
    if (cached !== undefined) {
      return cached
    }

    const result = await fn()
    this.set(toolName, params, result)
    return result
  }

  /**
   * 캐시 크기 조회 (디버깅용)
   */
  get size(): number {
    return this.cache.size
  }
}
