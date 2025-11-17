interface AboutPageProps {
  isActive: boolean;
}

export function AboutPage({ isActive }: AboutPageProps) {
  return (
    <section id="page-about" className={`page-section py-16 md:py-24 bg-[var(--bg-soft-light)] ${isActive ? 'active' : ''}`}>
      <div className="content-container max-w-4xl mx-auto">
        <a href="#home" className="page-link back-link"><i className="ti ti-arrow-left"></i> Back to Home</a>
        <h1 className="page-title">About Financial Folks</h1>
        <div className="prose dark:prose-invert max-w-none text-secondary text-base leading-relaxed">
          <h2 className="text-2xl font-semibold text-heading-light !mb-3 !mt-8">What is Financial Folks?</h2>
          <p>Financial Folks is a platform designed to make learning about money simple, fun, and accessible for young learners. Whether your child is curious about saving, budgeting, or even beginner investing, our goal is to provide tools, activities, and guidance that make financial lessons hands-on and engaging.</p>
          <p>We believe teaching kids smart money habits early sets the foundation for lifelong financial confidence and fiscal responsibility and that every child should have the chance to explore money in a safe and interactive way.</p>

          <h2 className="text-2xl font-semibold text-heading-light !mb-3 !mt-8">Why I Created This</h2>
          <p>My name is Arjun Mamidi, and I&apos;m a high school student from California. I love learning about finance and I believe that in today&apos;s world, managing money and understanding finance is more important than ever.</p>
          <p>When I started my own journey learning about money and investing, I realized there weren&apos;t enough fun, simple resources for kids and parents to use together.</p>
          <p>I created this book to make stocks and investing fun, easy, and interactive. I love learning about finance and I believe that in today&apos;s world, managing money and understanding finance is more important than ever.</p>
          <p>I created Financial Folks to help children explore money in a fun and practical way. This platform is filled with hands-on activities, easy-to-follow guides, and weekly blogs designed to make financial lessons engaging and simple. My goal is to give kids the tools and confidence they need to build smart money habits from an early age and to support parents in guiding them along the way.</p>
          <p>When I&apos;m not working on things like this, I love learning about history, geography, or just eating good food. I also enjoy physical activity and am on the wrestling team for my high school.</p>

          <h2 className="text-2xl font-semibold text-heading-light !mb-3 !mt-8">What You&apos;ll Find Here</h2>
          <ul>
            <li>Hands-on activities to teach kids about saving, spending, and investing</li>
            <li>Printable worksheets and guides for parents and children</li>
            <li>Weekly blogs with simple tips, lessons, and challenges</li>
            <li>A gallery showcasing our impact in the community so far</li>
            <li>A place to ask questions and get advice on teaching financial skills</li>
            <li>Resources, including my book and other tools for learning about money</li>
          </ul>

          <h2 className="text-2xl font-semibold text-heading-light !mb-3 !mt-8">Our Goal</h2>
          <p>We want to make learning about money exciting and approachable for kids of all ages. By combining fun activities with practical lessons, we aim to help children build confidence, responsibility, and curiosity about finance.</p>
        </div>
      </div>
    </section>
  );
}