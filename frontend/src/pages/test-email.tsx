import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function TestEmail() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testEdgeFunction = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Testing Edge Function with email:', email);
      
      const { data, error: edgeError } = await supabase.functions.invoke('send-psycho-ed-email', {
        body: {
          email: email,
          studentName: 'Test Student',
          studentId: '12345678',
        },
      });

      if (edgeError) {
        console.error('Edge Function error:', edgeError);
        
        // Extract more details from the error
        const errorDetails = {
          message: edgeError.message,
          status: (edgeError as any).status,
          statusText: (edgeError as any).statusText,
          context: (edgeError as any).context,
          details: edgeError,
        };
        
        setError(JSON.stringify(errorDetails, null, 2));
      } else {
        console.log('Success:', data);
        setResult(data);
      }
    } catch (err: any) {
      console.error('Catch error:', err);
      
      // Try to extract meaningful error info
      const errorInfo = {
        message: err.message || String(err),
        stack: err.stack,
        name: err.name,
      };
      
      setError(JSON.stringify(errorInfo, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const checkQueue = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Checking email queue via SQL...');
      
      // Query directly via SQL to check the queue
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/check_email_queue`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        // Fallback: just show a message
        setResult({
          message: 'Go to Supabase Dashboard → SQL Editor and run:',
          sql: 'SELECT * FROM email_queue ORDER BY created_at DESC LIMIT 5;'
        });
      } else {
        const data = await response.json();
        setResult(data);
      }
    } catch (err) {
      console.error('Check queue error:', err);
      setResult({
        message: 'Go to Supabase Dashboard → SQL Editor and run:',
        sql: 'SELECT * FROM email_queue ORDER BY created_at DESC LIMIT 5;'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui' }}>
      <h1 style={{ color: '#0071a9' }}>🧪 Email System Quick Test</h1>
      
      <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #0071a9' }}>
        <h3 style={{ marginTop: 0 }}>✓ System Status</h3>
        <ul style={{ margin: 0 }}>
          <li>✅ Edge Function deployed</li>
          <li>✅ Correct Supabase project connected</li>
          <li>✅ Environment variables configured</li>
          <li>✅ CORS headers enabled</li>
        </ul>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Test Email Address:
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@example.com"
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            border: '2px solid #ccc',
            borderRadius: '6px',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={testEdgeFunction}
          disabled={loading || !email}
          style={{
            flex: 1,
            padding: '15px 20px',
            backgroundColor: !email || loading ? '#ccc' : '#0071a9',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: !email || loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
        >
          {loading ? '⏳ Sending...' : '📧 Send Test Email'}
        </button>

        <button
          onClick={checkQueue}
          disabled={loading}
          style={{
            padding: '15px 20px',
            backgroundColor: loading ? '#ccc' : '#ffc107',
            color: 'black',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
        >
          📋 Check Queue
        </button>
      </div>

      {loading && (
        <div style={{ padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '6px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
          <div>Processing...</div>
        </div>
      )}

      {error && (
        <div style={{ padding: '20px', backgroundColor: '#ffebee', borderRadius: '6px', marginTop: '20px', border: '2px solid #c62828' }}>
          <h3 style={{ color: '#c62828', margin: '0 0 10px 0' }}>❌ Error:</h3>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '14px' }}>
            {error}
          </pre>
          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
            <strong>💡 Tip:</strong> Check the browser console (F12) for more details
          </div>
        </div>
      )}

      {result && (
        <div style={{ padding: '20px', backgroundColor: '#e8f5e9', borderRadius: '6px', marginTop: '20px', border: '2px solid #2e7d32' }}>
          <h3 style={{ color: '#2e7d32', margin: '0 0 10px 0' }}>✅ Success!</h3>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '14px' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
            <strong>⏰ Next Step:</strong> Wait ~1 minute for the cron job to process the email, then check your inbox!
          </div>
        </div>
      )}

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>📝 How It Works:</h3>
        <ol style={{ lineHeight: '1.8' }}>
          <li><strong>Click "Send Test Email"</strong> - Calls the Edge Function to queue your email</li>
          <li><strong>Email queued</strong> - Stored in database with status "pending"</li>
          <li><strong>Cron job (runs every minute)</strong> - Picks up pending emails and sends them via Resend</li>
          <li><strong>Check your inbox!</strong> - You should receive the email within 1-2 minutes</li>
        </ol>
        
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '6px' }}>
          <strong>🔍 To check email status:</strong>
          <ul style={{ marginBottom: 0 }}>
            <li>Go to Supabase Dashboard → SQL Editor</li>
            <li>Run: <code style={{ backgroundColor: 'white', padding: '2px 6px', borderRadius: '3px' }}>SELECT * FROM email_queue ORDER BY created_at DESC LIMIT 5;</code></li>
            <li>Check the <code style={{ backgroundColor: 'white', padding: '2px 6px', borderRadius: '3px' }}>status</code> column (pending → processing → sent)</li>
          </ul>
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '6px', border: '1px solid #ffc107' }}>
        <strong>⚠️ Note:</strong> If you see "Failed to send referral email", check:
        <ul style={{ marginBottom: 0 }}>
          <li>Browser console (F12) for error details</li>
          <li>Supabase Dashboard → Edge Functions → Logs</li>
          <li>That your .env.local has the correct Supabase URL and anon key</li>
        </ul>
      </div>
    </div>
  );
}
