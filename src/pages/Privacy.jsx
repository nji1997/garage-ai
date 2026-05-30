import { Link } from 'react-router-dom'
import styles from './PolicyPage.module.css'

export default function Privacy() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link to="/" className={styles.back}>← Back to Garage AI</Link>

        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.updated}>Last updated: May 2025</p>

        <p className={styles.lead}>
          Garage AI is a personal vehicle management app. We take your privacy seriously
          and are committed to being transparent about how your data is handled.
        </p>

        <h2>What data we collect</h2>
        <p>
          When you use Garage AI, we store the following data on your behalf:
        </p>
        <ul>
          <li>Your account information (name and email address via Google Sign-In or email/password)</li>
          <li>Vehicle information you add (year, make, model, VIN, mileage)</li>
          <li>Service records you create (date, service type, cost, mileage, notes)</li>
          <li>Any other content you voluntarily enter into the app</li>
        </ul>

        <h2>How we store your data</h2>
        <p>
          All data is stored securely using <strong>Google Firebase</strong> (Firestore), a
          cloud database service provided by Google. Data is encrypted in transit and at
          rest. Authentication is handled by Firebase Authentication.
        </p>

        <h2>How we use your data</h2>
        <p>
          Your data is used <strong>only</strong> to provide the features of the Garage AI app —
          displaying your vehicles, service history, cost analytics, and AI-powered advice.
          We do not use your data for advertising, profiling, or any purpose beyond operating
          the app.
        </p>

        <h2>We do not sell your data</h2>
        <p>
          We do not sell, rent, trade, or share your personal data with any third parties
          for commercial purposes.
        </p>

        <h2>AI features</h2>
        <p>
          When you use the AI Advisor, your vehicle data (make, model, service records) is
          sent to Anthropic's Claude API to generate responses. This data is used only to
          answer your query and is subject to{' '}
          <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer">
            Anthropic's privacy policy
          </a>.
        </p>

        <h2>Public share links</h2>
        <p>
          If you use the Share feature, a snapshot of your vehicle's service history
          (excluding financial data) is stored in a publicly accessible location.
          You can revoke sharing by removing the vehicle or contacting us.
        </p>

        <h2>Your rights & data deletion</h2>
        <p>
          You can delete your account and all associated data at any time by contacting us
          at{' '}
          <a href="mailto:irbynick2@gmail.com">irbynick2@gmail.com</a>.
          We will permanently delete your data within 30 days of your request.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy? Email us at{' '}
          <a href="mailto:irbynick2@gmail.com">irbynick2@gmail.com</a>.
        </p>

        <div className={styles.footer}>
          <Link to="/tos">Terms of Service</Link>
          <span>·</span>
          <Link to="/">Garage AI</Link>
        </div>
      </div>
    </div>
  )
}
