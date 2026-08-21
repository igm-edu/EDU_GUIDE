/* ============================================================================
   온보딩 데이터 (시드/폴백) — 구글 시트 연동 시엔 시트가 우선입니다.
   보통은 허브(index.html)에서 편집하고, 이 파일은 자동으로 관리됩니다.
   ----------------------------------------------------------------------------
   구조:
     course.steps[].tasks[].link = { enabled, label, url }  ← 링크 버튼을 항목마다
     단계·항목 개수는 자유. 참가자 주소: course.html?c=<slug>
     줄바꿈은 \n. 이미지는 파일명(→images 폴더)·웹주소·내장(data:) 모두 가능.
   ============================================================================ */

window.ONBOARDING = {

  hub: {
    title: "IGM 온보딩 허브",
    subtitle: "공개과정 입과 전 안내 페이지를 한 곳에서 관리합니다",
    password: "igm2026"
  },

  /* 새 과정/새 단계를 만들 때 쓰는 기본 템플릿 */
  defaultSteps: [
    {
      title: "클로드 데스크탑 설치",
      shortTitle: "클로드 설치",
      description: "실습을 위한 클로드 데스크탑 환경을 설치합니다.",
      image: "",
      tasks: [
        { title: "설치 파일 다운로드", desc: "아래 링크를 클릭하여 설치 파일을 다운로드합니다.", link: { enabled: true, label: "다운로드 페이지 이동", url: "" } },
        { title: "설치 및 실행",       desc: "설치 파일을 실행하고 안내에 따라 설치를 완료합니다.", link: { enabled: false, label: "", url: "" } },
        { title: "실행 확인",          desc: "클로드 데스크탑이 정상적으로 실행되는지 확인합니다.\n실행 후 Cowork 버튼이 제대로 눌러지는지도 확인해주세요.", link: { enabled: false, label: "", url: "" } }
      ]
    },
    {
      title: "오픈 카카오톡 입장",
      shortTitle: "카카오톡 입장",
      description: "강의 안내 및 공지를 받을 오픈 채팅방에 입장합니다.",
      image: "",
      tasks: [
        { title: "오픈 카카오톡 입장하기", desc: "아래 링크를 클릭하여 오픈 채팅방에 입장해주세요.", link: { enabled: true, label: "오픈 채팅방 입장", url: "" } },
        { title: "입장 확인",             desc: "입장 후, 채팅방에 '입장 완료' 메시지를 남겨주세요.", link: { enabled: false, label: "", url: "" } },
        { title: "공지 확인",             desc: "채팅방의 주요 공지 안내 사항을 확인해주세요.", link: { enabled: false, label: "", url: "" } }
      ]
    },
    {
      title: "사전 설문조사 진행",
      shortTitle: "사전 설문",
      description: "학습 경험을 더 잘 이해하기 위해 설문조사에 참여해주세요.",
      image: "",
      tasks: [
        { title: "설문조사 참여하기", desc: "아래 링크를 클릭하여 설문조사에 참여해주세요.", link: { enabled: true, label: "설문조사 페이지 이동", url: "" } },
        { title: "설문조사 제출",     desc: "설문조사를 모두 작성 후 제출해주세요.", link: { enabled: false, label: "", url: "" } },
        { title: "제출 완료 확인",    desc: "제출 완료 화면이 표시되면 준비가 완료됩니다.", link: { enabled: false, label: "", url: "" } }
      ]
    }
  ],

  defaultFaq: [
    { q: "클로드 데스크탑은 어디서 다운로드하나요?",
      a: "준비 사항 1단계의 '다운로드 페이지 이동' 버튼을 클릭하면 공식 다운로드 페이지로 이동합니다." },
    { q: "오픈 카카오톡 채팅방에 입장이 안 돼요.",
      a: "카카오톡 앱이 최신 버전인지 확인해주세요. 링크 클릭 후 카카오톡 앱이 실행되지 않으면 앱을 먼저 실행한 뒤 다시 시도해주세요." },
    { q: "설문조사를 이미 제출했는데 체크가 안 돼요.",
      a: "설문조사 제출 후 체크박스를 직접 클릭해 완료 표시를 해주세요. 체크 상태는 브라우저에 저장됩니다." },
    { q: "준비를 완료했는데 완료 버튼이 활성화되지 않아요.",
      a: "마지막 단계의 모든 체크박스가 체크되어 있는지 확인해주세요. 항목은 순서대로만 체크할 수 있습니다." },
    { q: "브라우저를 닫으면 진행 상태가 초기화되나요?",
      a: "아니요. 진행 상태는 브라우저에 자동 저장되어 다시 열어도 유지됩니다.\n단, 다른 브라우저나 시크릿 모드에서는 초기화될 수 있습니다." }
  ],

  courses: [
    {
      slug: "claude-agent",
      courseName: "클로드 에이전트 기반 업무혁명",
      tag: "AI 활용",
      active: true,
      previewUrl: "https://padlet.com/igm2023/claude_5",
      autoUrl:    "https://youtu.be/zXXXNCCWLBk?si=mcuznmRGs7CV0Ctg",
      startUrl:   "",

      // 메인 상단 HERO
      hero: {
        badge: "교육 안내",
        titleLines: ["클로드 에이전트 기반", "업무혁명 과정에 오신 것을", "환영합니다!"],
        highlightLast: true,
        description: "과정 시작에 앞서 아래의 교육 일정, 장소, 준비물을 확인해 주세요.\n원활한 학습 경험을 위해 필요한 정보를 미리 준비했습니다.",
        illust: "graduation"
      },

      // 메인 좌측 교육 안내 (그룹)
      info: {
        groups: [
          { icon: "calendar", title: "교육 일정", note: "", rows: [
            { icon: "calendar", label: "교육 일시", value: "2026년 7월 29일(수)", linkLabel: "", linkUrl: "" },
            { icon: "clock",    label: "교육 시간", value: "08:30 ~ 17:30 (8시간)", linkLabel: "", linkUrl: "" }
          ]},
          { icon: "pin", title: "장소", note: "", rows: [
            { icon: "building", label: "교육 장소", value: "IGM세계경영연구원 2층 더블린", linkLabel: "", linkUrl: "" },
            { icon: "pin",      label: "주소",     value: "서울 중구 장충단로 8길 11-16", linkLabel: "지도", linkUrl: "https://naver.me/5GpXhkyi" },
            { icon: "car",      label: "주차",     value: "IGM세계경영연구원 본원 1층\n(사전 설문 내 차량 번호를 기재해주세요.)", linkLabel: "", linkUrl: "" }
          ]},
          { icon: "clipboard", title: "준비물", note: "보다 원활한 학습을 위해 준비물을 꼭 확인해 주세요.", rows: [
            { icon: "laptop", label: "노트북", value: "개인 노트북 (사내 보안 상 AI 사용이 가능한지 점검)", linkLabel: "", linkUrl: "" },
            { icon: "monitor", label: "주변기기", value: "노트북 충전기 및 마우스", linkLabel: "", linkUrl: "" },
            { icon: "check",  label: "계정",   value: "클로드 회원가입이 완료된 계정", linkLabel: "", linkUrl: "" },
            { icon: "card",   label: "명함",   value: "동료 원우님들과 네트워크를 만들어가세요", linkLabel: "", linkUrl: "" },
            { icon: "edit",   label: "고민",   value: "이번 교육을 통해 해소하고 싶은 고민", linkLabel: "", linkUrl: "" }
          ]}
        ]
      },

      // 오시는 길
      directions: {
        enabled: true,
        title: "오시는 길",
        placeName: "IGM세계경영연구원 2층 더블린",
        placeDetail: "",
        address: "서울 중구 장충단로 8길 11-16",
        lat: null, lng: null,
        mapLink: "https://naver.me/5GpXhkyi",
        mapImage: "",
        transit: [
          { icon: "subway", label: "지하철", value: "" },
          { icon: "bus",    label: "버스",   value: "" },
          { icon: "car",    label: "자가용", value: "본원 1층 주차 가능" }
        ],
        note: "주차 공간이 혼잡할 수 있으니 가급적 대중교통 이용을 권장드립니다."
      },
      steps: [
        {
          title: "클로드 데스크탑 설치",
          shortTitle: "클로드 설치",
          description: "실습을 위한 클로드 데스크탑 환경을 설치합니다.",
          image: "",
          tasks: [
            { title: "설치 파일 다운로드", desc: "아래 링크를 클릭하여 설치 파일을 다운로드합니다.", link: { enabled: true, label: "다운로드 페이지 이동", url: "https://claude.com/download" } },
            { title: "설치 및 실행",       desc: "설치 파일을 실행하고 안내에 따라 설치를 완료합니다.", link: { enabled: false, label: "", url: "" } },
            { title: "실행 확인",          desc: "클로드 데스크탑이 정상적으로 실행되는지 확인합니다.\n실행 후 Cowork 버튼이 제대로 눌러지는지도 확인해주세요.", link: { enabled: false, label: "", url: "" } }
          ]
        },
        {
          title: "오픈 카카오톡 입장",
          shortTitle: "카카오톡 입장",
          description: "강의 안내 및 공지를 받을 오픈 채팅방에 입장합니다.",
          image: "",
          tasks: [
            { title: "오픈 카카오톡 입장하기", desc: "아래 링크를 클릭하여 오픈 채팅방에 입장해주세요.", link: { enabled: true, label: "오픈 채팅방 입장", url: "https://open.kakao.com/o/gcgE89xi" } },
            { title: "입장 확인",             desc: "입장 후, 채팅방에 '입장 완료' 메시지를 남겨주세요.", link: { enabled: false, label: "", url: "" } },
            { title: "공지 확인",             desc: "채팅방의 주요 공지 안내 사항을 확인해주세요.", link: { enabled: false, label: "", url: "" } }
          ]
        },
        {
          title: "사전 설문조사 진행",
          shortTitle: "사전 설문",
          description: "학습 경험을 더 잘 이해하기 위해 설문조사에 참여해주세요.",
          image: "",
          tasks: [
            { title: "설문조사 참여하기", desc: "아래 링크를 클릭하여 설문조사에 참여해주세요.", link: { enabled: true, label: "설문조사 페이지 이동", url: "https://forms.office.com/r/5j3ECxXHkZ" } },
            { title: "설문조사 제출",     desc: "설문조사를 모두 작성 후 제출해주세요.", link: { enabled: false, label: "", url: "" } },
            { title: "제출 완료 확인",    desc: "제출 완료 화면이 표시되면 준비가 완료됩니다.", link: { enabled: false, label: "", url: "" } }
          ]
        }
      ],
      faq: null
    }
  ]
};
