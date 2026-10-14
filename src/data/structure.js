// src/data/structure.js
// Content of the organisational-structure page, transcribed from
// public/documents/Организациска Структура.pdf.
//
// nodes:    label shown in the chart box -> [title, subtitle?]
// tiers:    group headings used by the stacked (mobile / tablet) chart
// sections: the numbered descriptions ("table of contents"). A point is a
//           string, or [label, [sub-points]] for a nested list. Items whose
//           id matches a chart node are linked to it.

export const STRUCTURE = {
  mk: {
    nodes: {
      assembly: ["Собрание"],
      board: ["Управен одбор"],
      president: ["Претседател", "Сашо Лазаревски"],
      supervisory: ["Надзорен одбор"],
      other: ["Други тела и функции", "комисии"],
      disciplinary: ["Дисциплинска комисија"],
      appeals: ["Апелациона комисија"],
      women: ["Комисија за женски спорт"],
      infrastructure: ["Комисија за развој и инфраструктура"],
      international: ["Комисија за меѓународна соработка"],
      education: ["Одделение за едукација и лиценцирање"],
      gensec: ["Генерален секретар"],
      sportdir: ["Спортски директор"],
      finance: ["Финансиски администратор", "сметководител"],
      pr: ["PR и медиумски координатор"],
      vpSwim: ["Пливање", "VP Мартин Стефановски"],
      vpOpen: ["Пливање – отворени води", "VP Александар Филипчев"],
      vpPolo: ["Ватерполо", "VP Александар Георгиевски"],
      selector: ["Селектор на национална селекција"],
      expert: ["Стручни тела и одбори", "SW · OWS · WP"],
      techdir: ["Технички директор / секретар"],
      judges: ["Судиска комисија"],
      coaches: ["Тренерска комисија"],
      licensing: ["Комисија за лиценцирање и регистрација"],
      antidoping: ["Антидопинг и етичка комисија"],
      orgcommittee: ["Организациски одбор за натпревари"],
    },
    tiers: {
      assembly: "Највисок орган",
      governance: "Органи на управување",
      executive: "Извршни позиции",
      vps: "Потпретседатели по дисциплина",
      expertRow: "Стручни функции",
      commissions: "Стручни комисии",
      other: "Други тела и функции",
    },
    sections: [
      {
        title: "Органи на пливачката федерација",
        items: [
          {
            id: "assembly",
            title: "Собрание",
            points: [
              "Највисок орган на Федерацијата",
              "Се состои од претставници на сите регистрирани клубови/членки",
              [
                "Надлежности:",
                [
                  "Усвојување на статут и акти",
                  "Избор и разрешување на Претседател, Управен и Надзорен одбор",
                  "Усвојување извештаи и програми за работа",
                  "Одобрување буџет и финансиски извештај",
                ],
              ],
            ],
          },
          {
            id: "president",
            title: "Претседател",
            points: [
              "Застапник и овластен потписник на Федерацијата",
              "Се избира на мандат од 4 години",
              "Ја претставува федерацијата на национално и меѓународно ниво",
            ],
          },
          {
            id: "board",
            title: "Управен одбор",
            points: [
              "Извршен орган на Федерацијата",
              "Број на членови: 5–11",
              "Се избира од страна на Собранието",
              [
                "Надлежности:",
                [
                  "Имплементација на програмите и стратегијата",
                  "Организација на натпревари",
                  "Врски со институции и спортски тела",
                ],
              ],
            ],
          },
          {
            id: "supervisory",
            title: "Надзорен одбор",
            points: [
              "Контролен орган на Федерацијата",
              "Надгледува финансиско и материјално работење",
              "Поднесува извештај до Собранието",
            ],
          },
        ],
      },
      {
        title: "Извршни и стручни позиции во федерацијата",
        items: [
          {
            id: "gensec",
            title: "Генерален секретар",
            points: [
              "Главен административен и организациски координатор на федерацијата",
              [
                "Одговорен за:",
                [
                  "Комуникација со клубови, институции и меѓународни тела (LEN, FINA)",
                  "Подготовка на документи, записници и кореспонденција",
                  "Секретар на Собранието и Управниот одбор",
                ],
              ],
              "Работи во координација со Претседателот и Управниот одбор",
            ],
          },
          {
            id: "sportdir",
            title: "Спортски директор",
            points: [
              "Одговорен за спортската стратегија и развој",
              [
                "Надгледува:",
                [
                  "Календар на натпревари",
                  "Програми за развој на млади пливачи",
                  "Настапи на национални селекции",
                ],
              ],
              "Соработува со тренери, клубови и селектори",
            ],
          },
          {
            id: "techdir",
            title: "Технички директор / Технички секретар",
            points: [
              "Одговорен за техничката реализација на натпревари и настани",
              "Го координира судискиот тим, логистика и технички услови",
              "Работи тесно со организаторите на државни и меѓународни натпревари",
            ],
          },
          {
            id: "finance",
            title: "Финансиски администратор / сметководител",
            points: [
              "Води финансиска евиденција",
              "Подготвува буџети, извештаи и апликации за проекти",
              "Комуницира со банки, институции и спонзори",
            ],
          },
          {
            id: "pr",
            title: "PR и медиумски координатор",
            points: [
              "Комуникација со јавноста и медиумите",
              "Одржување на веб-страна, социјални мрежи, промоција",
              "Изработка на медиумски соопштенија и визуелни материјали",
            ],
          },
          {
            id: "selector",
            title: "Селектор на национална селекција",
            points: [
              "Се назначува за одреден временски период или настан",
              "Ги селектира и организира настапите на репрезентацијата",
              "Работи со Спортскиот директор и Тренерската комисија",
            ],
          },
        ],
      },
      {
        title: "Стручни тела и одбори",
        items: [
          {
            id: "expert",
            title: "Стручна комисија за пливање, маратонско, ватерполо",
            points: [
              "Ги разгледува техничките аспекти на пливањето",
              "Предлага календар на натпревари",
              "Работи на развој на млади категории",
            ],
          },
          {
            id: "judges",
            title: "Судиска комисија",
            points: [
              "Организира, лиценцира и едуцира судии",
              "Обезбедува регуларност на натпреварите",
            ],
          },
          {
            id: "licensing",
            title: "Комисија за лиценцирање и регистрација",
            points: [
              "Води евиденција на пливачи, клубови, тренери и судии",
              "Ги издава лиценците согласно правилниците",
            ],
          },
          {
            id: "coaches",
            title: "Тренерска комисија",
            points: [
              "Развој на едукација и стручно усовршување на тренери",
              "Координација со меѓународни програми за тренерска обука",
            ],
          },
          {
            id: "antidoping",
            title: "Антидопинг и етичка комисија",
            points: [
              "Следи усогласеност со антидопинг правилници",
              "Ги следи етичките норми во спортот",
            ],
          },
          {
            id: "orgcommittee",
            title: "Организациски одбори за натпревари",
            points: [
              "Се формираат по потреба за секој поголем настан (државно првенство, маратони и сл.)",
              "Соработка со локални власти и спонзори",
            ],
          },
        ],
      },
      {
        title: "Други тела и функции во федерацијата",
        items: [
          {
            id: "disciplinary",
            title: "Дисциплинска комисија",
            points: [
              "Го разгледува однесувањето на членови, клубови, пливачи, тренери и судии",
              "Изрекува мерки: опомена, суспензија, исклучување",
              "Работи според Правилник за дисциплина",
            ],
          },
          {
            id: "appeals",
            title: "Апелациона комисија",
            points: [
              "Ги разгледува жалбите на одлуките од Дисциплинската комисија",
              "Втора и последна инстанца во рамки на Федерацијата",
            ],
          },
          {
            id: "women",
            title: "Комисија за женски спорт",
            points: [
              "Работи на промоција и развој на женското учество во пливањето",
              "Следи родова рамноправност и вклученост",
            ],
          },
          {
            id: "infrastructure",
            title: "Комисија за развој и инфраструктура",
            points: [
              "Планира и поддржува развој на пливачки капацитети (базени, услови)",
              "Соработува со општини и спортски центри",
            ],
          },
          {
            id: "international",
            title: "Комисија за меѓународна соработка",
            points: [
              "Контакти со меѓународни федерации (World Aquatics, LEN, Олимписки комитет)",
              "Организација на меѓународни настапи и настани",
            ],
          },
          {
            id: "education",
            title: "Одделение за едукација и лиценцирање",
            points: [
              "Организира обуки за тренери, судии, организатори",
              "Издава и обновува лиценци според утврдени критериуми",
            ],
          },
          {
            id: "veterans",
            title: "Комисија за ветерани и рекреативно пливање",
            points: [
              "Развој на програми за постари категории и рекреативци",
              "Организира неселективни и аматерски натпревари",
            ],
          },
          {
            id: "clubs",
            title: "Здружение на клубови (консултативно тело)",
            points: [
              "Не е формален орган, туку платформа за комуникација меѓу клубовите",
              "Дава мислења, иницијативи и предлози до Управниот одбор",
            ],
          },
        ],
      },
    ],
  },

  en: {
    nodes: {
      assembly: ["Assembly"],
      board: ["Executive Board"],
      president: ["President", "Sasho Lazarevski"],
      supervisory: ["Supervisory Board"],
      other: ["Other bodies and functions", "commissions"],
      disciplinary: ["Disciplinary Commission"],
      appeals: ["Appeals Commission"],
      women: ["Women's Sport Commission"],
      infrastructure: ["Development and Infrastructure Commission"],
      international: ["International Cooperation Commission"],
      education: ["Education and Licensing Department"],
      gensec: ["Secretary General"],
      sportdir: ["Sports Director"],
      finance: ["Financial Administrator", "accountant"],
      pr: ["PR and Media Coordinator"],
      vpSwim: ["Swimming", "VP Martin Stefanovski"],
      vpOpen: ["Open Water Swimming", "VP Aleksandar Filipchev"],
      vpPolo: ["Water Polo", "VP Aleksandar Georgievski"],
      selector: ["National Team Selector"],
      expert: ["Technical bodies and committees", "SW · OWS · WP"],
      techdir: ["Technical Director / Secretary"],
      judges: ["Officials' Commission"],
      coaches: ["Coaches' Commission"],
      licensing: ["Licensing and Registration Commission"],
      antidoping: ["Anti-Doping and Ethics Commission"],
      orgcommittee: ["Competition Organising Committee"],
    },
    tiers: {
      assembly: "Highest body",
      governance: "Governing bodies",
      executive: "Executive positions",
      vps: "Vice-presidents by discipline",
      expertRow: "Technical functions",
      commissions: "Technical commissions",
      other: "Other bodies and functions",
    },
    sections: [
      {
        title: "Governing bodies of the Swimming Federation",
        items: [
          {
            id: "assembly",
            title: "Assembly",
            points: [
              "The highest body of the Federation",
              "Made up of representatives of all registered member clubs",
              [
                "Competences:",
                [
                  "Adopting the statute and other acts",
                  "Electing and dismissing the President, Executive Board and Supervisory Board",
                  "Adopting reports and work programmes",
                  "Approving the budget and the financial report",
                ],
              ],
            ],
          },
          {
            id: "president",
            title: "President",
            points: [
              "Represents the Federation and is its authorised signatory",
              "Elected for a four-year term",
              "Represents the Federation at national and international level",
            ],
          },
          {
            id: "board",
            title: "Executive Board",
            points: [
              "The executive body of the Federation",
              "Number of members: 5–11",
              "Elected by the Assembly",
              [
                "Competences:",
                [
                  "Implementing programmes and strategy",
                  "Organising competitions",
                  "Relations with institutions and sports bodies",
                ],
              ],
            ],
          },
          {
            id: "supervisory",
            title: "Supervisory Board",
            points: [
              "The control body of the Federation",
              "Oversees financial and material operations",
              "Reports to the Assembly",
            ],
          },
        ],
      },
      {
        title: "Executive and professional positions",
        items: [
          {
            id: "gensec",
            title: "Secretary General",
            points: [
              "Chief administrative and organisational coordinator of the Federation",
              [
                "Responsible for:",
                [
                  "Communication with clubs, institutions and international bodies (LEN, FINA)",
                  "Preparing documents, minutes and correspondence",
                  "Acting as secretary of the Assembly and the Executive Board",
                ],
              ],
              "Works in coordination with the President and the Executive Board",
            ],
          },
          {
            id: "sportdir",
            title: "Sports Director",
            points: [
              "Responsible for sports strategy and development",
              [
                "Oversees:",
                [
                  "The competition calendar",
                  "Development programmes for young swimmers",
                  "National team appearances",
                ],
              ],
              "Works with coaches, clubs and selectors",
            ],
          },
          {
            id: "techdir",
            title: "Technical Director / Technical Secretary",
            points: [
              "Responsible for the technical delivery of competitions and events",
              "Coordinates the officials, logistics and technical conditions",
              "Works closely with organisers of national and international competitions",
            ],
          },
          {
            id: "finance",
            title: "Financial Administrator / Accountant",
            points: [
              "Keeps the financial records",
              "Prepares budgets, reports and project applications",
              "Liaises with banks, institutions and sponsors",
            ],
          },
          {
            id: "pr",
            title: "PR and Media Coordinator",
            points: [
              "Communication with the public and the media",
              "Runs the website, social media and promotion",
              "Produces press releases and visual materials",
            ],
          },
          {
            id: "selector",
            title: "National Team Selector",
            points: [
              "Appointed for a specific period or event",
              "Selects the national team and organises its appearances",
              "Works with the Sports Director and the Coaches' Commission",
            ],
          },
        ],
      },
      {
        title: "Technical bodies and committees",
        items: [
          {
            id: "expert",
            title: "Technical Commission for Swimming, Open Water and Water Polo",
            points: [
              "Reviews the technical aspects of swimming",
              "Proposes the competition calendar",
              "Works on developing the youth categories",
            ],
          },
          {
            id: "judges",
            title: "Officials' Commission",
            points: [
              "Organises, licenses and trains officials",
              "Ensures competitions are run correctly",
            ],
          },
          {
            id: "licensing",
            title: "Licensing and Registration Commission",
            points: [
              "Keeps records of swimmers, clubs, coaches and officials",
              "Issues licences in line with the regulations",
            ],
          },
          {
            id: "coaches",
            title: "Coaches' Commission",
            points: [
              "Develops coach education and professional training",
              "Coordinates with international coach-education programmes",
            ],
          },
          {
            id: "antidoping",
            title: "Anti-Doping and Ethics Commission",
            points: [
              "Monitors compliance with anti-doping rules",
              "Upholds ethical standards in sport",
            ],
          },
          {
            id: "orgcommittee",
            title: "Competition Organising Committees",
            points: [
              "Formed as needed for each major event (national championships, marathons, etc.)",
              "Cooperate with local authorities and sponsors",
            ],
          },
        ],
      },
      {
        title: "Other bodies and functions",
        items: [
          {
            id: "disciplinary",
            title: "Disciplinary Commission",
            points: [
              "Reviews the conduct of members, clubs, swimmers, coaches and officials",
              "Imposes measures: warning, suspension, expulsion",
              "Works under the Disciplinary Regulations",
            ],
          },
          {
            id: "appeals",
            title: "Appeals Commission",
            points: [
              "Hears appeals against decisions of the Disciplinary Commission",
              "Second and final instance within the Federation",
            ],
          },
          {
            id: "women",
            title: "Women's Sport Commission",
            points: [
              "Promotes and develops women's participation in swimming",
              "Monitors gender equality and inclusion",
            ],
          },
          {
            id: "infrastructure",
            title: "Development and Infrastructure Commission",
            points: [
              "Plans and supports the development of swimming facilities (pools, conditions)",
              "Works with municipalities and sports centres",
            ],
          },
          {
            id: "international",
            title: "International Cooperation Commission",
            points: [
              "Contact with international federations (World Aquatics, LEN, Olympic Committee)",
              "Organises international appearances and events",
            ],
          },
          {
            id: "education",
            title: "Education and Licensing Department",
            points: [
              "Runs training for coaches, officials and organisers",
              "Issues and renews licences against set criteria",
            ],
          },
          {
            id: "veterans",
            title: "Veterans and Recreational Swimming Commission",
            points: [
              "Develops programmes for masters and recreational swimmers",
              "Organises open and amateur competitions",
            ],
          },
          {
            id: "clubs",
            title: "Association of Clubs (advisory body)",
            points: [
              "Not a formal body, but a platform for communication between clubs",
              "Gives opinions, initiatives and proposals to the Executive Board",
            ],
          },
        ],
      },
    ],
  },
};

// Chart-node id -> the description item it opens. Nodes not listed here
// (the vice-presidents, the "other bodies" header) have no own entry.
export const DESCRIBED = new Set(
  STRUCTURE.mk.sections.flatMap((s) => s.items.map((i) => i.id))
);
