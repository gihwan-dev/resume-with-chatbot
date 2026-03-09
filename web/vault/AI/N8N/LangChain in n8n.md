n8n은 LangChain의 기능을 구현한 몇 가지 노드들을 제공한다. LangChain 노드들은 설정 가능하기 때문에, 원하는 에이전트, LLM, 메모리 등등을 설정할 수 있다. LangChain 노드들을 n8n 노드들에 연결할 수도 있다.

## n8n에서의 LangChain 개념
이 페이지에서는 n8n 노드와 LangChange 개념이 어떻게 매핑되는지 기술한다.

## Tigger nodes
[Chat Trigger](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-langchain.chattrigger/)

## Cluster nodes
[[Cluster nodes]]는 n8n 워크플로우에서 기능을 제공하기 위해서 함께 사용하는 노드 그룹을 의미한다. 하나의 [[Root nodes]]와 여러개의 [[Sub nodes]]로 구성된다.

![[Pasted image 20250727135144.png]]

### Root nocdes
각 클러스터는 하나의 루트 노드로 시작한다.
#### Chains
[[Chain]]은 LLMs의 연속, 혹은 연관된 도구 등등 하나의 LLM 만으로는 제공할 수 없는 동작을 지원하기 위에 연견된 것을 말한다.