안전한 프론트엔드 서비스 및 서버사이드 렌더링(SSR) 서버를 운영하기 위해서는 오류 감지 시스템과 디버깅 절차를 잘 구축하는 것이 중요합니다. 다음은 이러한 시스템을 설계하고 구현하는 데 필요한 주요 요소와 방법들입니다.

### 1. 오류 감지 시스템
오류 감지 시스템은 발생하는 오류를 실시간으로 모니터링하고 기록하며, 이를 통해 신속한 대응이 가능하도록 합니다.

#### 1.1. 클라이언트 측 오류 감지
- **Error Boundary (React)**: React에서는 `ErrorBoundary` 컴포넌트를 사용하여 자식 컴포넌트에서 발생하는 렌더링 오류를 잡을 수 있습니다.
    ```jsx
    class ErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false };
      }

      static getDerivedStateFromError(error) {
        return { hasError: true };
      }

      componentDidCatch(error, errorInfo) {
        // 오류 로깅 서비스에 오류 정보를 보냅니다.
        logErrorToMyService(error, errorInfo);
      }

      render() {
        if (this.state.hasError) {
          return <h1>Something went wrong.</h1>;
        }

        return this.props.children;
      }
    }
    ```

- **Global Error Handling**: 전역 오류 핸들러를 설정하여 예상치 못한 오류를 포착합니다.
    ```javascript
    window.onerror = function(message, source, lineno, colno, error) {
      // 오류 로깅 서비스에 오류 정보를 보냅니다.
      logErrorToMyService({ message, source, lineno, colno, error });
    };

    window.addEventListener('unhandledrejection', function(event) {
      // Promise rejection 오류 처리
      logErrorToMyService(event.reason);
    });
    ```

- **로그 수집 도구**: Sentry, LogRocket, New Relic 등의 서비스를 사용하여 클라이언트 측 오류를 수집하고 분석합니다.

#### 1.2. 서버 측 오류 감지
- **서버 로깅**: 서버의 모든 요청과 오류를 로깅하는 시스템을 구축합니다. `winston`, `morgan` 등의 로깅 라이브러리를 사용할 수 있습니다.
    ```javascript
    const express = require('express');
    const morgan = require('morgan');
    const winston = require('winston');

    const app = express();

    // morgan으로 HTTP 요청 로깅
    app.use(morgan('combined'));

    // winston으로 오류 로깅
    const logger = winston.createLogger({
      level: 'error',
      format: winston.format.json(),
      transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' })
      ],
    });

    app.use((err, req, res, next) => {
      logger.error(err.stack);
      res.status(500).send('Something broke!');
    });
    ```

- **모니터링 도구**: Datadog, Prometheus, Grafana 같은 모니터링 도구를 사용하여 서버 상태를 모니터링하고 오류를 감지합니다.

### 2. 디버깅
디버깅은 발견된 오류를 분석하고 수정하는 과정입니다.

#### 2.1. 클라이언트 측 디버깅
- **브라우저 개발자 도구**: Chrome DevTools, Firefox Developer Tools 등을 사용하여 자바스크립트 디버깅, 네트워크 요청 분석, DOM 검사 등을 수행합니다.
- **Source Maps**: 빌드 과정에서 생성된 소스 맵을 사용하여 번들링된 코드의 원본 소스 코드를 확인합니다.

#### 2.2. 서버 측 디버깅
- **로컬 디버깅**: Node.js에서는 `--inspect` 플래그를 사용하여 디버깅을 활성화하고 Chrome DevTools로 디버깅할 수 있습니다.
    ```sh
    node --inspect index.js
    ```

- **로깅 분석**: 서버 로그 파일을 분석하여 오류의 원인을 파악합니다. 로그 파일은 로그 수준(정보, 경고, 오류 등)에 따라 잘 정리되어 있어야 합니다.

### 3. 지속적 통합 및 배포 (CI/CD)
- **자동 테스트**: 오류를 사전에 방지하기 위해 Jest, Mocha, Cypress 등의 도구를 사용하여 자동화된 테스트를 작성하고 실행합니다.
- **CI 도구**: Jenkins, GitHub Actions, GitLab CI/CD를 사용하여 코드를 빌드하고 테스트하며, 오류가 발견되면 배포를 중단합니다.
- **CD 도구**: Kubernetes, Docker 등을 사용하여 배포 파이프라인을 자동화하고 관리합니다.

### 4. 사용자 피드백
- **피드백 수집 도구**: 사용자로부터 직접 피드백을 받을 수 있는 시스템을 구축합니다. 예를 들어, 사용자 피드백 위젯을 웹사이트에 추가하거나 이메일을 통해 피드백을 받을 수 있습니다.
- **유저 모니터링 도구**: Hotjar, FullStory 같은 도구를 사용하여 사용자 행동을 분석하고 오류 발생 상황을 재현합니다.
