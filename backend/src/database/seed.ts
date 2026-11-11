import bcrypt from 'bcryptjs';
import { dbAsync } from './db.js';
import { initializeDatabase } from './schema.js';

export async function seedDatabase(): Promise<void> {
  await initializeDatabase();

  console.log('🌱 Seeding initial data...');

  // 1. Seed Demo User
  const demoEmail = 'student@englishgo.edu.vn';
  const existingUser = await dbAsync.get('SELECT id FROM users WHERE email = ?', [demoEmail]);

  let userId: number;
  if (!existingUser) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('student123', salt);
    const today = new Date().toISOString().split('T')[0];

    const result = await dbAsync.run(
      `INSERT INTO users (email, password_hash, full_name, avatar_url, daily_goal_minutes, streak_count, last_active_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        demoEmail,
        passwordHash,
        'Nguyen Van A',
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        20,
        5,
        today
      ]
    );
    userId = result.lastID;
    console.log(`👤 Demo User created: ${demoEmail} / student123 (ID: ${userId})`);
  } else {
    userId = existingUser.id;
    console.log(`👤 Demo User already exists (ID: ${userId})`);
  }

  // 2. Check if topics exist
  const existingTopics = await dbAsync.all('SELECT id FROM topics LIMIT 1');
  if (existingTopics.length === 0) {
    // Topic 1: University Life
    const t1 = await dbAsync.run(
      `INSERT INTO topics (title, description, icon, category, level, order_index)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['University Life', 'Essential vocabulary for campus, lectures, and exams', 'graduation-cap', 'vocabulary', 'Beginner', 1]
    );

    // Topic 2: Job Interview & Career
    const t2 = await dbAsync.run(
      `INSERT INTO topics (title, description, icon, category, level, order_index)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['Career & Interview', 'Ace your internships and professional meetings', 'briefcase', 'vocabulary', 'Intermediate', 2]
    );

    // Topic 3: Technology & AI
    const t3 = await dbAsync.run(
      `INSERT INTO topics (title, description, icon, category, level, order_index)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['Technology & AI', 'Modern tech terms, digital skills and innovation', 'cpu', 'vocabulary', 'Intermediate', 3]
    );

    // Topic 4: Daily Social & Travel
    const t4 = await dbAsync.run(
      `INSERT INTO topics (title, description, icon, category, level, order_index)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['Social & Travel', 'Everyday conversation, ordering food and directions', 'compass', 'vocabulary', 'Beginner', 4]
    );

    console.log('📚 Topics inserted.');

    // 3. Seed Vocabularies
    const vocabList = [
      // University Life
      {
        topic_id: t1.lastID,
        word: 'Curriculum',
        phonetic: '/kəˈrɪkjələm/',
        part_of_speech: 'noun',
        meaning_vi: 'Chương trình giảng dạy / đào tạo',
        example_en: 'The university updated its computer science curriculum this semester.',
        example_vi: 'Trường đại học đã cập nhật chương trình giảng dạy khoa học máy tính trong học kỳ này.',
        audio_url: 'https://ssl.gstatic.com/dictionary/static/sounds/20200429/curriculum--_gb_1.mp3'
      },
      {
        topic_id: t1.lastID,
        word: 'Assignment',
        phonetic: '/əˈsaɪnmənt/',
        part_of_speech: 'noun',
        meaning_vi: 'Bài tập được giao, bài tập lớn',
        example_en: 'Students must submit their mobile app assignment before midnight.',
        example_vi: 'Sinh viên phải nộp bài tập lớn ứng dụng di động trước nửa đêm.',
        audio_url: 'https://ssl.gstatic.com/dictionary/static/sounds/20200429/assignment--_gb_1.mp3'
      },
      {
        topic_id: t1.lastID,
        word: 'Lecture',
        phonetic: '/ˈlektʃər/',
        part_of_speech: 'noun',
        meaning_vi: 'Bài giảng, tiết học lý thuyết trên giảng đường',
        example_en: 'The professor gave an inspiring lecture on software architecture.',
        example_vi: 'Giáo sư đã có một bài giảng truyền cảm hứng về kiến trúc phần mềm.',
        audio_url: 'https://ssl.gstatic.com/dictionary/static/sounds/20200429/lecture--_gb_1.mp3'
      },
      {
        topic_id: t1.lastID,
        word: 'Dormitory',
        phonetic: '/ˈdɔːrmətɔːri/',
        part_of_speech: 'noun',
        meaning_vi: 'Ký túc xá sinh viên',
        example_en: 'Living in the campus dormitory helped him make lifelong friends.',
        example_vi: 'Sống trong ký túc xá trường giúp anh ấy kết bạn suốt đời.',
        audio_url: 'https://ssl.gstatic.com/dictionary/static/sounds/20200429/dormitory--_gb_1.mp3'
      },
      {
        topic_id: t1.lastID,
        word: 'Tuition',
        phonetic: '/tuːˈɪʃn/',
        part_of_speech: 'noun',
        meaning_vi: 'Học phí',
        example_en: 'She received a full scholarship that covered her entire university tuition.',
        example_vi: 'Cô ấy đã nhận được học bổng toàn phần chi trả toàn bộ học phí đại học.',
        audio_url: 'https://ssl.gstatic.com/dictionary/static/sounds/20200429/tuition--_gb_1.mp3'
      },

      // Career & Interview
      {
        topic_id: t2.lastID,
        word: 'Applicant',
        phonetic: '/ˈæplɪkənt/',
        part_of_speech: 'noun',
        meaning_vi: 'Ứng viên nộp hồ sơ xin việc',
        example_en: 'There were over fifty applicants for the junior mobile developer position.',
        example_vi: 'Có hơn 50 ứng viên ứng tuyển vào vị trí lập trình viên di động tập sự.',
        audio_url: 'https://ssl.gstatic.com/dictionary/static/sounds/20200429/applicant--_gb_1.mp3'
      },
      {
        topic_id: t2.lastID,
        word: 'Negotiate',
        phonetic: '/nɪˈɡoʊʃieɪt/',
        part_of_speech: 'verb',
        meaning_vi: 'Đàm phán, thương lượng (lương, hợp đồng)',
        example_en: 'He managed to negotiate a higher starting salary during the final interview.',
        example_vi: 'Anh ấy đã đàm phán thành công mức lương khởi điểm cao hơn trong buổi phỏng vấn cuối.',
        audio_url: 'https://ssl.gstatic.com/dictionary/static/sounds/20200429/negotiate--_gb_1.mp3'
      },
      {
        topic_id: t2.lastID,
        word: 'Competence',
        phonetic: '/ˈkɑːmpɪtəns/',
        part_of_speech: 'noun',
        meaning_vi: 'Năng lực, khả năng chuyên môn',
        example_en: 'Her technical competence in React Native impressed the hiring manager.',
        example_vi: 'Năng lực kỹ thuật của cô ấy về React Native đã gây ấn tượng với quản lý tuyển dụng.',
        audio_url: 'https://ssl.gstatic.com/dictionary/static/sounds/20200429/competence--_gb_1.mp3'
      },
      {
        topic_id: t2.lastID,
        word: 'Resilience',
        phonetic: '/rɪˈzɪliəns/',
        part_of_speech: 'noun',
        meaning_vi: 'Khả năng phục hồi, kiên cường vượt khó',
        example_en: 'Working under tight deadlines requires mental resilience and team collaboration.',
        example_vi: 'Làm việc dưới áp lực thời hạn gấp đòi hỏi sự kiên cường và tinh thần phối hợp nhóm.',
        audio_url: 'https://ssl.gstatic.com/dictionary/static/sounds/20200429/resilience--_gb_1.mp3'
      },

      // Technology & AI
      {
        topic_id: t3.lastID,
        word: 'Algorithm',
        phonetic: '/ˈælɡərɪðəm/',
        part_of_speech: 'noun',
        meaning_vi: 'Thuật toán',
        example_en: 'Search engines use sophisticated algorithms to rank search results.',
        example_vi: 'Các công cụ tìm kiếm sử dụng thuật toán phức tạp để xếp hạng kết quả tìm kiếm.',
        audio_url: 'https://ssl.gstatic.com/dictionary/static/sounds/20200429/algorithm--_gb_1.mp3'
      },
      {
        topic_id: t3.lastID,
        word: 'Deployment',
        phonetic: '/dɪˈplɔɪmənt/',
        part_of_speech: 'noun',
        meaning_vi: 'Triển khai (phần mềm, ứng dụng)',
        example_en: 'Automated CI/CD pipelines facilitate rapid deployment of mobile apps.',
        example_vi: 'Quy trình CI/CD tự động giúp triển khai ứng dụng di động nhanh chóng.',
        audio_url: 'https://ssl.gstatic.com/dictionary/static/sounds/20200429/deployment--_gb_1.mp3'
      },
      {
        topic_id: t3.lastID,
        word: 'Scalability',
        phonetic: '/ˌskeɪləˈbɪləti/',
        part_of_speech: 'noun',
        meaning_vi: 'Khả năng mở rộng quy mô',
        example_en: 'Cloud computing ensures the scalability of the backend infrastructure.',
        example_vi: 'Điện toán đám mây đảm bảo khả năng mở rộng của hạ tầng backend.',
        audio_url: 'https://ssl.gstatic.com/dictionary/static/sounds/20200429/scalability--_gb_1.mp3'
      },

      // Social & Travel
      {
        topic_id: t4.lastID,
        word: 'Itinerary',
        phonetic: '/aɪˈtɪnərəri/',
        part_of_speech: 'noun',
        meaning_vi: 'Lịch trình chuyến đi, lộ trình',
        example_en: 'Our travel itinerary includes visits to three historical cities.',
        example_vi: 'Lịch trình chuyến đi của chúng tôi gồm các chuyến thăm tới ba thành phố lịch sử.',
        audio_url: 'https://ssl.gstatic.com/dictionary/static/sounds/20200429/itinerary--_gb_1.mp3'
      },
      {
        topic_id: t4.lastID,
        word: 'Hospitality',
        phonetic: '/ˌhɑːspɪˈtæləti/',
        part_of_speech: 'noun',
        meaning_vi: 'Lòng hiếu khách, ngành khách sạn nhà hàng',
        example_en: 'We were deeply touched by the warm hospitality of the local villagers.',
        example_vi: 'Chúng tôi vô cùng xúc động trước lòng hiếu khách nồng hậu của người dân địa phương.',
        audio_url: 'https://ssl.gstatic.com/dictionary/static/sounds/20200429/hospitality--_gb_1.mp3'
      }
    ];

    for (const v of vocabList) {
      await dbAsync.run(
        `INSERT INTO vocabularies (topic_id, word, phonetic, part_of_speech, meaning_vi, example_en, example_vi, audio_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [v.topic_id, v.word, v.phonetic, v.part_of_speech, v.meaning_vi, v.example_en, v.example_vi, v.audio_url]
      );
    }
    console.log(`📖 Seeded ${vocabList.length} vocabulary items.`);
  }

  // 4. Seed Grammar Lessons
  const existingGrammar = await dbAsync.all('SELECT id FROM grammar_lessons LIMIT 1');
  if (existingGrammar.length === 0) {
    const g1 = await dbAsync.run(
      `INSERT INTO grammar_lessons (title, level, summary, content_markdown, order_index)
       VALUES (?, ?, ?, ?, ?)`,
      [
        'Present Perfect vs. Past Simple',
        'Beginner',
        'Distinguish completed past actions from experiences connecting to the present.',
        `# Present Perfect vs. Past Simple

## 1. Past Simple (Quá khứ đơn)
- **Công thức**: \`S + V2/ed + O\`
- **Cách dùng**: Diễn tả hành động **đã kết thúc hoàn toàn** trong quá khứ và có thời gian xác định rõ ràng (\`yesterday\`, \`in 2020\`, \`last week\`, \`two days ago\`).
- *Ví dụ*: *I visited Da Nang last summer.*

## 2. Present Perfect (Hiện tại hoàn thành)
- **Công thức**: \`S + have/has + V3/ed + O\`
- **Cách dùng**:
  - Diễn tả hành động xảy ra trong quá khứ nhưng **kết quả hoặc ảnh hưởng vẫn còn ở hiện tại**.
  - Diễn tả **trải nghiệm** (từng làm / chưa từng làm) với \`ever\`, \`never\`, \`already\`, \`yet\`.
  - Diễn tả hành động bắt đầu từ quá khứ và **kéo dài đến hiện tại** với \`since\` (mốc thời gian) và \`for\` (khoảng thời gian).
- *Ví dụ*: *I have lived in Hanoi for four years.*

## 3. Mẹo nhớ nhanh khi làm bài thi
- Có mốc thời gian quá khứ cụ thể (\`ago\`, \`last...\`, \`in 1999\`) ➔ **Past Simple**.
- Có \`since\`, \`for\`, \`so far\`, \`up to now\`, \`recently\` ➔ **Present Perfect**.`,
        1
      ]
    );

    // Questions for g1
    const g1Questions = [
      {
        question: 'She _____ in this software company since she graduated in 2022.',
        options: ['worked', 'has worked', 'is working', 'works'],
        correct_answer: 'has worked',
        explanation: 'Dấu hiệu nhận biết: "since + mốc thời gian quá khứ" chia thì Hiện tại hoàn thành (has worked).'
      },
      {
        question: 'They _____ the new mobile update yesterday.',
        options: ['have launched', 'launch', 'launched', 'are launching'],
        correct_answer: 'launched',
        explanation: 'Dấu hiệu nhận biết: "yesterday" là thời điểm xác định trong quá khứ nên dùng Past Simple (launched).'
      },
      {
        question: 'Have you ever _____ to Singapore?',
        options: ['be', 'was', 'been', 'being'],
        correct_answer: 'been',
        explanation: 'Cấu trúc câu hỏi trải nghiệm: Have you ever + V3/ed (been).'
      }
    ];

    for (const q of g1Questions) {
      await dbAsync.run(
        `INSERT INTO grammar_questions (lesson_id, question, options_json, correct_answer, explanation)
         VALUES (?, ?, ?, ?, ?)`,
        [g1.lastID, q.question, JSON.stringify(q.options), q.correct_answer, q.explanation]
      );
    }

    const g2 = await dbAsync.run(
      `INSERT INTO grammar_lessons (title, level, summary, content_markdown, order_index)
       VALUES (?, ?, ?, ?, ?)`,
      [
        'Conditional Sentences (Types 1, 2, 3)',
        'Intermediate',
        'Master real, hypothetical, and regretful conditions in English.',
        `# Conditional Sentences (Câu điều kiện)

## 1. Type 1: Real in Present / Future (Có thể xảy ra)
- **Cấu trúc**: \`If + S + V(hiện tại đơn), S + will / can + V(nguyên thể)\`
- *Ví dụ*: *If you study hard, you will pass the mobile exam.*

## 2. Type 2: Unreal in Present (Không có thật ở hiện tại)
- **Cấu trúc**: \`If + S + V2/ed (were), S + would / could + V(nguyên thể)\`
- *Ví dụ*: *If I had more free time, I would learn a third language.*

## 3. Type 3: Unreal in Past (Trái ngược quá khứ / tiếc nuối)
- **Cấu trúc**: \`If + S + had + V3/ed, S + would have + V3/ed\`
- *Ví dụ*: *If we had left earlier, we wouldn't have missed the bus.*`,
        2
      ]
    );

    const g2Questions = [
      {
        question: 'If it rains tomorrow, we _____ our outdoor workshop.',
        options: ['will cancel', 'would cancel', 'cancelled', 'have cancelled'],
        correct_answer: 'will cancel',
        explanation: 'Câu điều kiện loại 1 (sự việc có thể xảy ra ở tương lai): If + hiện tại đơn, S + will + V.'
      },
      {
        question: 'If I _____ you, I would take that internship offer immediately.',
        options: ['am', 'was', 'were', 'have been'],
        correct_answer: 'were',
        explanation: 'Câu điều kiện loại 2 giả định lời khuyên: "If I were you, I would...".'
      }
    ];

    for (const q of g2Questions) {
      await dbAsync.run(
        `INSERT INTO grammar_questions (lesson_id, question, options_json, correct_answer, explanation)
         VALUES (?, ?, ?, ?, ?)`,
        [g2.lastID, q.question, JSON.stringify(q.options), q.correct_answer, q.explanation]
      );
    }

    console.log('✍️ Seeded Grammar lessons & questions.');
  }

  // 5. Seed Listening Exercises
  const existingListening = await dbAsync.all('SELECT id FROM listening_exercises LIMIT 1');
  if (existingListening.length === 0) {
    await dbAsync.run(
      `INSERT INTO listening_exercises (title, level, audio_url, duration_seconds, transcript, questions_json)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        'Campus Orientation Day',
        'Beginner',
        'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
        45,
        'Welcome all new students to the Computer Science faculty orientation! Today you will meet your academic advisors, collect your student badges, and receive your course timetables. The library tour starts at 2 PM in the main hall. Please make sure you have activated your student portal account before the end of the day.',
        JSON.stringify([
          {
            id: 1,
            question: 'What time does the campus library tour begin?',
            options: ['10 AM', '12 PM', '2 PM', '4 PM'],
            correct_answer: '2 PM',
            explanation: 'Trong bài nghe: "The library tour starts at 2 PM in the main hall."'
          },
          {
            id: 2,
            question: 'What must students activate before the end of the day?',
            options: ['Their bank cards', 'Their student portal accounts', 'Their parking permits', 'Their gym membership'],
            correct_answer: 'Their student portal accounts',
            explanation: 'Transcript nói rõ: "Please make sure you have activated your student portal account..."'
          }
        ])
      ]
    );

    await dbAsync.run(
      `INSERT INTO listening_exercises (title, level, audio_url, duration_seconds, transcript, questions_json)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        'Preparing for a Technical Job Interview',
        'Intermediate',
        'https://actions.google.com/sounds/v1/office/typing_on_laptop.ogg',
        60,
        'When preparing for a mobile development interview, reviewing core fundamentals like asynchronous programming, state management, and component lifecycle is essential. In addition to technical questions, interviewers often ask behavioral questions to evaluate teamwork, communication skills, and how candidates solve unexpected bugs under pressure.',
        JSON.stringify([
          {
            id: 1,
            question: 'Besides technical skills, what do interviewers assess with behavioral questions?',
            options: ['Typing speed', 'Teamwork and communication skills', 'Clothing style', 'College grades'],
            correct_answer: 'Teamwork and communication skills',
            explanation: 'Trích đoạn: "...evaluate teamwork, communication skills, and how candidates solve unexpected bugs under pressure."'
          }
        ])
      ]
    );
    console.log('🎧 Seeded Listening exercises.');
  }

  // 6. Seed Reading Passages
  const existingReading = await dbAsync.all('SELECT id FROM reading_passages LIMIT 1');
  if (existingReading.length === 0) {
    await dbAsync.run(
      `INSERT INTO reading_passages (title, level, passage_text, questions_json)
       VALUES (?, ?, ?, ?)`,
      [
        'The Evolution of Mobile Learning Apps',
        'Intermediate',
        `Over the past decade, mobile learning has transformed from simple digital flashcards into intelligent, personalized educational platforms. The widespread adoption of smartphones and high-speed internet allows students to study anywhere, whether during their daily commute or in short breaks between classes.

Modern educational applications integrate gamification techniques—such as daily streaks, achievement badges, and timed quizzes—to maintain user motivation. Cognitive psychology research shows that spaced repetition and microlearning significantly boost long-term retention compared to traditional cramming.

Furthermore, the introduction of on-device AI and large language models provides learners with instant grammar feedback, pronunciation assessment, and tailored learning pathways. As technology continues to evolve, mobile education bridges geographical barriers, making quality language learning accessible to millions worldwide.`,
        JSON.stringify([
          {
            id: 1,
            question: 'According to the passage, what is a key benefit of mobile learning apps?',
            options: [
              'They completely replace universities',
              'They enable students to learn anywhere at their own pace',
              'They eliminate the need for practicing grammar',
              'They guarantee a high score without studying'
            ],
            correct_answer: 'They enable students to learn anywhere at their own pace',
            explanation: 'Đoạn 1 nêu rõ: "...allows students to study anywhere, whether during their daily commute or in short breaks between classes."'
          },
          {
            id: 2,
            question: 'Which method is mentioned as superior to traditional cramming for long-term retention?',
            options: [
              'Spaced repetition and microlearning',
              'Memorizing dictionaries',
              'Studying 10 hours continuously',
              'Watching English movies without subtitles'
            ],
            correct_answer: 'Spaced repetition and microlearning',
            explanation: 'Đoạn 2: "...spaced repetition and microlearning significantly boost long-term retention compared to traditional cramming."'
          }
        ])
      ]
    );
    console.log('📖 Seeded Reading passages.');
  }

  // 7. Seed Quizzes
  const existingQuizzes = await dbAsync.all('SELECT id FROM quizzes LIMIT 1');
  if (existingQuizzes.length === 0) {
    await dbAsync.run(
      `INSERT INTO quizzes (title, type, time_limit_seconds, questions_json)
       VALUES (?, ?, ?, ?)`,
      [
        'Daily Challenge: Quick English Boost',
        'daily_challenge',
        180,
        JSON.stringify([
          {
            id: 1,
            question: 'Choose the word closest in meaning to "Curriculum":',
            options: ['Syllabus / Course of study', 'Campus building', 'Tuition fee', 'Student badge'],
            correct_answer: 'Syllabus / Course of study',
            explanation: '"Curriculum" nghĩa là chương trình học / khung giảng dạy.'
          },
          {
            id: 2,
            question: 'If she _____ earlier, she would have caught the morning train.',
            options: ['wakes up', 'woke up', 'had woken up', 'has woken up'],
            correct_answer: 'had woken up',
            explanation: 'Câu điều kiện loại 3 diễn tả tiếc nuối trong quá khứ: If + had + V3/ed.'
          },
          {
            id: 3,
            question: 'Which word means "the ability to recover quickly from difficulties"?',
            options: ['Resilience', 'Algorithm', 'Assignment', 'Applicant'],
            correct_answer: 'Resilience',
            explanation: '"Resilience" là khả năng kiên cường phục hồi sau khó khăn.'
          },
          {
            id: 4,
            question: 'I have not seen him _____ last semester.',
            options: ['for', 'since', 'during', 'in'],
            correct_answer: 'since',
            explanation: '"last semester" là mốc thời gian cụ thể nên đi với "since".'
          },
          {
            id: 5,
            question: 'The mobile team managed to _____ the critical bug before release.',
            options: ['resolve', 'resign', 'refuse', 'regret'],
            correct_answer: 'resolve',
            explanation: '"Resolve the bug" nghĩa là giải quyết / sửa lỗi phần mềm.'
          }
        ])
      ]
    );

    console.log('🎯 Seeded Quizzes.');
  }

  // 8. Seed Sample Daily Stats for Demo
  const existingStats = await dbAsync.all('SELECT id FROM user_daily_stats WHERE user_id = ?', [userId]);
  if (existingStats.length === 0) {
    const dates = ['2026-11-07', '2026-11-08', '2026-11-09', '2026-11-10', '2026-11-11'];
    for (let i = 0; i < dates.length; i++) {
      await dbAsync.run(
        `INSERT INTO user_daily_stats (user_id, date, words_learned, lessons_completed, quiz_score_avg, study_time_minutes)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, dates[i], (i + 1) * 4, i + 1, 80 + i * 4, 15 + i * 5]
      );
    }
    console.log('📊 Seeded initial user learning statistics.');
  }

  console.log('✨ Seed database completed successfully!');
}

// Run immediately if executed directly
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(() => {
      console.log('🎉 Seed script finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Seed script error:', err);
      process.exit(1);
    });
}

