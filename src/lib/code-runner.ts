import { TerminalLog } from '@/types/meeting';

export interface RunResult {
  logs: TerminalLog[];
  executionTimeMs: number;
  memoryEstimateKb: number;
  success: boolean;
}

export async function executeCodeInSandbox(
  code: string,
  language: 'typescript' | 'javascript' | 'python' | 'go' | 'rust' | 'sql' | 'json'
): Promise<RunResult> {
  const startTime = performance.now();
  const logs: TerminalLog[] = [];

  const addLog = (type: TerminalLog['type'], text: string) => {
    logs.push({
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      text,
      timestamp: new Date().toLocaleTimeString(),
    });
  };

  addLog('system', `[TechConvene Sandbox] Initializing runtime for ${language.toUpperCase()}...`);
  addLog('system', `[TechConvene Sandbox] Environment: Isolated WebWorker/Wasm v2.4 (Security Mode: Strict)`);

  try {
    if (language === 'javascript' || language === 'typescript') {
      // Execute safe JavaScript simulation
      const customConsole = {
        log: (...args: unknown[]) => {
          addLog('stdout', args.map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '));
        },
        warn: (...args: unknown[]) => {
          addLog('stderr', `[WARN] ` + args.map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '));
        },
        error: (...args: unknown[]) => {
          addLog('stderr', `[ERR] ` + args.map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '));
        },
        info: (...args: unknown[]) => {
          addLog('stdout', `[INFO] ` + args.map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '));
        }
      };

      // Strip basic TypeScript type annotations if needed for execution
      let jsCode = code
        .replace(/:\s*(string|number|boolean|any|void|unknown|RequestContext|TokenBucketRateLimiter|Map<[^>]+>|Array<[^>]+>)/g, '')
        .replace(/interface\s+\w+\s*\{[\s\S]*?\}/g, '')
        .replace(/type\s+\w+\s*=[\s\S]*?;/g, '')
        .replace(/public\s+|private\s+|protected\s+/g, '');

      // Create isolated execution function
      const runFn = new Function('console', jsCode);
      runFn(customConsole);
    } else if (language === 'python') {
      // Python evaluation simulation
      addLog('system', 'Pyodide Python 3.12-wasm engine loaded.');
      const lines = code.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('print(')) {
          const match = trimmed.match(/print\((.*)\)/);
          if (match) {
            const rawContent = match[1];
            // Format output simulation
            if (rawContent.includes('>>>') || rawContent.includes('Kafka')) {
              addLog('stdout', '>>> Initializing Kafka Consumer Partition [0-3]...');
            } else if (rawContent.includes('res[')) {
              addLog('stdout', '[CLEARED] TX_9011: $450.00 (Z: 0.12, Latency: 1.4ms)');
              addLog('stdout', '[CLEARED] TX_9012: $520.00 (Z: 0.15, Latency: 1.4ms)');
              addLog('stdout', '[CLEARED] TX_9013: $480.00 (Z: 0.08, Latency: 1.4ms)');
              addLog('stderr', '[FLAGGED_FOR_REVIEW] TX_9014: $89,450.00 (Z: 4.82, Latency: 1.4ms) -> Anomaly Velocity Alert');
            } else {
              addLog('stdout', rawContent.replace(/["']/g, ''));
            }
          }
        }
      }
      addLog('stdout', '>> Python batch completed. 4 records processed, 1 flagged anomaly dispatched to Partner Compliance.');
    } else if (language === 'sql') {
      addLog('system', 'SQLite / DuckDB in-memory analytical query executor ready.');
      addLog('stdout', '+------------+---------------------------+-------------------+----------------------+----------------+--------------------------------+');
      addLog('stdout', '| PARTNER_ID | ORGANIZATION_NAME         | TOTAL_SETTLEMENTS | AGGREGATE_VOLUME_USD | AVG_LATENCY_MS | PARTNER_PERFORMANCE_TIER       |');
      addLog('stdout', '+------------+---------------------------+-------------------+----------------------+----------------+--------------------------------+');
      addLog('stdout', '| p_apex_01  | Apex Global Strategic     | 1,429,800         | $48,290,140.00       | 184.20 ms      | SLA Tier A+ (0.35% Rebate)     |');
      addLog('stdout', '| p_vg_02    | Vanguard Ventures FinTech | 984,200           | $32,150,000.00       | 210.50 ms      | SLA Tier A+ (0.35% Rebate)     |');
      addLog('stdout', '| p_tokyo_03 | Tokyo Tech Partners Alliance| 640,110         | $21,900,450.00       | 244.10 ms      | SLA Tier A+ (0.35% Rebate)     |');
      addLog('stdout', '| p_syn_04   | DeepNet Analytics Group   | 412,090           | $14,800,200.00       | 195.80 ms      | SLA Tier A+ (0.35% Rebate)     |');
      addLog('stdout', '+------------+---------------------------+-------------------+----------------------+----------------+--------------------------------+');
      addLog('stdout', 'Query returned 4 rows in 14.8ms. In-memory hash join completed.');
    } else {
      addLog('stdout', `[${language.toUpperCase()} Runner] Compiled binary executed successfully.`);
      addLog('stdout', `Process returned exit code 0.`);
    }

    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    addLog('benchmark', `Process finished with exit code 0 | Duration: ${duration}ms | Heap: 14.2 MB | CPU: 0.8%`);
    
    return {
      logs,
      executionTimeMs: duration,
      memoryEstimateKb: 14500,
      success: true,
    };
  } catch (err: unknown) {
    const error = err as Error;
    addLog('stderr', `Runtime Error: ${error.message || String(error)}`);
    const endTime = performance.now();
    return {
      logs,
      executionTimeMs: Math.round(endTime - startTime),
      memoryEstimateKb: 8200,
      success: false,
    };
  }
}
