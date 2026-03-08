---
author: Gihwan-dev
pubDatetime: 2024-06-20T08:40:34.347Z
title: 왜 pnpm은 빠를까?
slug: deep-dive-into-pnpm
featured: true
draft: false
tags:
  - study
  - deep-dive
  - pnpm
description: 늘 사용하는 패키지 매니저 pnpm이 어떻게 빠르게 동작할 수 있는지 알아봤습니다.
---

항상 사용하던 패키지 매니저에 대해 너무 모르지 않나? 하는 생각이 들었고 분석해 보기로 했다.

## Table of contents

일단 기본적인 내용부터 정리하고 들어가겠다.

## package란?

레지스트리에서 다운로드 할 수 있는 재사용 가능한 소프트웨어 조각이다. 각 패키지들은 다른 패키지에 의존할 수 있고 하지 않을 수 있다.

## Package Manager란?

프로젝트에서 사용되는 `package`들을 관리해주는 소프트웨어다.

## Package.json

프로젝트에 대한 메타데이터를 기록하고 의존성을 추적하기 위해 사용되는 파일이다.

## Lock 파일

패키지 매니저에 의해 자동으로 기록되는 파일이다. 프로젝트 내부에서 사용되는 모든 의존성에 대한 버전 정보가 담긴다. 이 `Lock`파일이 생성되고 나면 이 파일을 기반으로 의존성을 설치하게 된다.

## Motivation

`npm`에서 만약 우리가 100개의 의존성을 가진다면 100개의 의존성 복사본을 가지게 된다. `node_modules` 안에 의존성이 설치되고 그 의존성이 의존하는 또 다른 의존성이 해당 폴더 안의 `node_modules`를 설치하게 된다. 다음과 같은 이미지 많이 봤을거다.

![노드 모듈 블랙홀](node-blackhole-image.png)

`pnpm`에서는 의존성들이 주소를 가진채 저장된다. 다음 사진을 보자.

![pnpm 저장 방식](pnpm-content-addressable.png)

그렇기에 다음과 같은 일들이 가능해진다.

1. 만약 다른 버전의 의존성을 가지고 있다면, 스토어에 기존 패키지와 추가되는 패키지의 다른 부분만 추가된다. 예를들어 기존 패키지에 100개의 의존하는 패키지가 있고, 새로운 버전에 100개가 있다. 이 100개의 파일 중 단 하나의 패키지만 다르다면, 이 다른 패키지 하나만 `store`에 추가된다. 공식 문서에 애매하게 설명되어 있는데... 걍 동일한 의존성을 중복설치 하지 않는다는 말이다.
2. 모든 파일들은 디스크의 한 공간에 저장된다. 패키지들이 설치되면 이 파일들에 대한 `hard-link`를 생성한다. 이를 통해 여러 프로젝트에서 하나의 의존성을 공유할 수 있게 된다.

> hard-link 란?
> 파일 시스템에서 하나의 파일에 여러 개의 이름을 할당하는 방법이다. 즉, 동일한 데이터를 가리키는 다른 이름이 생기는 것이다.

결과적으로 디스크의 많은 공간을 절약할 수 있고, 설치 해야할 파일들의 수가 줄어들며 설치 속도가 증가하게 된다.

## 설치 속도 증가 이유

`pnpm`은 다음 세 가지 단계를 통해 `install`을 수행한다:

1. **Dependency Resolution**: 필요한 모든 의존성들을 식별하고 저장소로 `fetch` 한다.
2. **Directory Structure Calculation**: 의존성을 기반으로 `node_modules`폴더의 구조를 계산한다.
3. **Linking Dependencies**: 남은 모든 의존성을 `fetch`하고 `store`에서 `node_modules`로 `hard-link`를 생성한다.

![pnpm 설치 방법에 대한 이미지](boosting-install-speed-1.png)

기본적으로 각각 패키지에 대한 `Resoving`, `Fetching`, `Linking` 단계는 독립적으로 실행된다.

다만 이를 병렬적으로 수행하며 전체적인 스케줄링은 1, 2, 3번에 따라 진행된다.

1번 단계에서 `Resolving`과 `Fetching`을 동시에 진행한다. 모든 파일에 대한 `Resolving`이 끝나면 2번 단계가 시작된다.

2번 단계에서 폴더 구조 계산을 진행하는데 이 동안에도 `Fetching`은 계속 진행된다. 이 계산이 끝나면 3번 단계로 이동한다.

3번 단계에서도 `Fetching`이 계속 진행되고 있는 패키지가 있을 수 있다. 그런 패키지는 계속해서 `Fetching`을 하고 완료된 패키지들은 `Linking` 작업을 진행한다.

이런 방식은 `node_modules` 의존성을 처리하는 전통적인 방식보다 훨씬 빠르다.

![trenditional installation progress](trenditional-install-progress.png)

## non-flat node_modules 생성

`npm`이나 `yarn classic`은 의존성을 설치할 때 호이스팅을 통해 `node_modules` 구조를 `flat` 하게 만들어 디스크 공간을 절약하려 한다. 그러나 이렇게 하면 다음과 같은 문제가 있다.

1. 모듈들이 의존하지 않는 패키지에 접근할 수 있다.
2. 의존성을 `flatten` 하는 알고리즘이 많이 복잡하다.
3. 특정 패키지들은 어떤 프로젝트의 `node_modules` 안에 복사되어야 한다.

디폴트로 `pnpm`은 프로젝트에 `symlinks`를 사용해 직접적으로 사용되는 의존성만을 루트 `node_modules` 디렉터리에 추가한다.

![symlink image](symlinks-image.png)

`node_modules`를 `ls -l` 커맨드로 출력해본 결과
[pnpm ls -l result](pnpm-real-node-modules.png)

보는것 처럼 루트 `node_modules`에 심볼링 링크들을 생성하고 `.pnpm` 폴더 안에 실제 패키지들이 설치되어 있다.

`.pnpm`의 목적은 모든 패키지를 `flat`하게 저장하는 역할을 한다. 모든 패키지는 다음과 같은 패턴으로 찾을 수 있다. `.pnpm/<name>@<version>/node_modules/<name>`

## 결론

`pnpm`의 등장 이유는 `npm`의 노드 모듈 중복 설치 문제와 불안정성을 해결하기 위해 등장했다. 실제로 `npm`의 문제를 해결하기 위해 다양한 패키지 매니저들이 노력을 하고 있다. `npm`, `yarn classic`, `yarn berry`, `pnpm` 등이 있다.

`yarn berry` 는 `node_modules` 자체를 없애는 시도를 했고 `pnpm`은 `symbolic link` 를 이용해 각 패키지의 별칭을 생성해 활용하는 방법을 시도했다.

다음 번에는 `pnpm`에서 `peerDependencies`를 `resolve` 하는 방식을 알아봐야겠다.

---

## 출처

[An introduction to how JavaScript package managers work](https://medium.com/free-code-camp/javascript-package-managers-101-9afd926add0a)

[pnpm official docs](https://pnpm.io/motivation)
