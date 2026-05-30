import { Link } from 'react-router-dom'
import styles from './PolicyPage.module.css'

export default function Terms() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link to="/" className={styles.back}>← Back to Garage AI</Link>

        <h1 className={styles.title}>Terms of Service</h1>
        <p className={styles.updated}>Last updated: May 2025</p>

        <p className={styles.lead}>
          By using Garage AI, you agree to these terms. Please read them carefully.
        </p>

        <h2>What Garage AI is</h2>
        <p>
          Garage AI is a personal vehicle tracking app that helps you log service records,
          track costs, and get AI-powered maintenance advice. It is provided free of charge.
        </p>

        <h2>Your account</h2>
        <p>
          You are responsible for maintaining the security of your account and for all
          activity that occurs under it. You must provide accurate information when
          creating your account.
        </p>

        <h2>Your data</h2>
        <p>
          You own the data you enter into Garage AI. You are responsible for the accuracy
          of the information you add. We do not verify vehicle data, service records, or
          any other content you submit.
        </p>

        <h2>Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the app for any unlawful purpose</li>
          <li>Attempt to access other users' data</li>
          <li>Abuse or overload the service in ways that disrupt other users</li>
          <li>Reverse engineer or attempt to extract source code</li>
        </ul>

        <h2>AI-generated content</h2>
        <p>
          The AI Advisor feature provides suggestions based on your vehicle data.
          This is not professional mechanical advice. Always consult a qualified
          mechanic before making decisions about vehicle safety or repairs.
        </p>

        <h2>Service availability</h2>
        <p>
          Garage AI is provided "as is" without warranties of any kind. We may modify,
          suspend, or discontinue the service at any time without notice. We are not
          liable for any loss of data or service interruptions.
        </p>

        <h2>Changes to these terms</h2>
        <p>
          We may update these terms from time to time. Continued use of the app after
          changes are posted constitutes acceptance of the updated terms.
        </p>

        <h2>Contact</h2>
        <p>
          Questions? Email us at{' '}
          <a href="mailto:get.garage.ai@gmail.com">get.garage.ai@gmail.com</a>.
        </p>

        <div className={styles.footer}>
          <Link to="/privacy">Privacy Policy</Link>
          <span>·</span>
          <Link to="/">Garage AI</Link>
        </div>
      </div>
    </div>
  )
}
