// Sample data showing what will be synced to Monday.com

console.log('=' .repeat(100));
console.log('SAMPLE DATA THAT WILL BE SYNCED TO MONDAY.COM TONIGHT');
console.log('=' .repeat(100));
console.log('\n📌 Board ID: 5026323056');
console.log('📌 Sync Time: 11:50 PM CET (Daily)');
console.log('📌 Source: All 25 forms from your Meta page');
console.log('📌 Includes: Both Facebook and Instagram leads\n');

// Sample leads based on your form structure
const sampleLeads = [
  {
    name: 'Mohamad Rikas',
    email: 'rikasmohamed124@gmail.com',
    phone: '+94758242959',
    formName: 'Skilled Professionals Tamil SL 2026/Feb',
    formId: '123456789',
    metaLeadId: '889588630522880',
    date: '2026-02-14',
    age: '27',
    qualification: 'degree',
    fieldOfStudy: 'Accountant'
  },
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '+94771234567',
    formName: 'German Language Course - Colombo',
    formId: '987654321',
    metaLeadId: '889588630522881',
    date: '2026-02-14',
    age: '24',
    qualification: 'higher_national_diploma_',
    fieldOfStudy: 'Business Management'
  },
  {
    name: 'Kasun Perera',
    email: 'kasun.p@example.com',
    phone: '+94777654321',
    formName: 'Skilled Professionals Tamil SL 2026/Feb',
    formId: '123456789',
    metaLeadId: '889588630522882',
    date: '2026-02-14',
    age: '29',
    qualification: 'degree',
    fieldOfStudy: 'Engineering'
  },
  {
    name: 'Nisha Fernando',
    email: 'nisha.f@example.com',
    phone: '+94769876543',
    formName: 'German A1 Course - Kandy',
    formId: '456789123',
    metaLeadId: '889588630522883',
    date: '2026-02-14',
    age: '26',
    qualification: 'degree',
    fieldOfStudy: 'Computer Science'
  },
  {
    name: 'Rajesh Kumar',
    email: 'rajesh.k@example.com',
    phone: '+94712345678',
    formName: 'Skilled Professionals Tamil SL 2026/Feb',
    formId: '123456789',
    metaLeadId: '889588630522884',
    date: '2026-02-14',
    age: '31',
    qualification: 'degree',
    fieldOfStudy: 'Medicine'
  },
  {
    name: 'Amaya Silva',
    email: 'amaya.silva@example.com',
    phone: '+94778765432',
    formName: 'German Language - Galle Branch',
    formId: '789123456',
    metaLeadId: '889588630522885',
    date: '2026-02-14',
    age: '23',
    qualification: 'higher_national_diploma_',
    fieldOfStudy: 'Hospitality Management'
  },
  {
    name: 'Dinesh Jayawardena',
    email: 'dinesh.j@example.com',
    phone: '+94765432109',
    formName: 'Skilled Professionals Tamil SL 2026/Feb',
    formId: '123456789',
    metaLeadId: '889588630522886',
    date: '2026-02-14',
    age: '28',
    qualification: 'degree',
    fieldOfStudy: 'Architecture'
  },
  {
    name: 'Sanduni Wickramasinghe',
    email: 'sanduni.w@example.com',
    phone: '+94723456789',
    formName: 'German B1 Course - Negombo',
    formId: '321654987',
    metaLeadId: '889588630522887',
    date: '2026-02-14',
    age: '25',
    qualification: 'degree',
    fieldOfStudy: 'Marketing'
  },
  {
    name: 'Chaminda Rathnayake',
    email: 'chaminda.r@example.com',
    phone: '+94789012345',
    formName: 'Skilled Professionals Tamil SL 2026/Feb',
    formId: '123456789',
    metaLeadId: '889588630522888',
    date: '2026-02-14',
    age: '30',
    qualification: 'degree',
    fieldOfStudy: 'Civil Engineering'
  },
  {
    name: 'Thilini Mendis',
    email: 'thilini.m@example.com',
    phone: '+94756789012',
    formName: 'German Language - Matara',
    formId: '654987321',
    metaLeadId: '889588630522889',
    date: '2026-02-14',
    age: '27',
    qualification: 'degree',
    fieldOfStudy: 'Nursing'
  }
];

console.log('\n' + '─'.repeat(100));
console.log('MONDAY.COM BOARD COLUMNS THAT WILL BE POPULATED:');
console.log('─'.repeat(100) + '\n');

sampleLeads.forEach((lead, index) => {
  console.log(`\n📋 Lead ${index + 1} - Monday.com Item:`);
  console.log('─'.repeat(100));
  console.log(`Item Name:         ${lead.name}`);
  console.log(`Email:             ${lead.email} (Column: text_mkw3spks)`);
  console.log(`Phone Number:      ${lead.phone} (Column: text_mkw2wpvr)`);
  console.log(`WhatsApp Number:   ${lead.phone} (Column: phone_mkv0a5mm)`);
  console.log(`ad_name:           ${lead.formName} (Column: text_mkvwwp5t)`);
  console.log(`ad_id:             ${lead.formId} (Column: text_mkvwk3h9)`);
  console.log(`META LEAD ID:      ${lead.metaLeadId} (Column: text_mkw0n3t5)`);
  console.log(`Date:              ${lead.date} (Column: date_mkw2jae2)`);
  console.log(`Lead Source:       Facebook Lead Ad (Column: text_mkvdkw8g)`);
  console.log(`Age:               ${lead.age} (Column: text_mkw38wse)`);
  console.log(`Qualification:     ${lead.qualification} (Column: text_mkw32n6r)`);
  console.log(`Client Address:    ${lead.fieldOfStudy} (Column: text_mkv080k2)`);
  console.log(`Comment from Meta: Platform: Meta Lead Ad (FB/IG - not specified by API)`);
  console.log(`                   Form ID: ${lead.formId}`);
  console.log(`                   Lead ID: ${lead.metaLeadId}`);
  console.log(`                   (Column: text_mkv7nzpn)`);
});

console.log('\n' + '='.repeat(100));
console.log('\n✅ KEY FEATURES:');
console.log('   • Syncs from ALL 25 forms automatically');
console.log('   • Includes both Facebook and Instagram leads');
console.log('   • Duplicate prevention by email address');
console.log('   • Form name included so you know which ad generated the lead');
console.log('   • All custom form fields preserved in Comment from Meta');
console.log('\n⚠️  API LIMITATIONS:');
console.log('   • Cannot distinguish Facebook vs Instagram (Meta API limitation)');
console.log('   • No campaign name or ad set name available (Meta API limitation)');
console.log('   • Form ID used instead of actual ad_id (best available identifier)');
console.log('\n🕐 NEXT SYNC: Tonight at 11:50 PM CET');
console.log('=' .repeat(100) + '\n');
