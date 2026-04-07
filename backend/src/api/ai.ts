import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, requireRole } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// POST /api/ai/chat
router.post('/chat', requireAuth, async (req: Request, res: Response) => {
  const { message, loanId, conversationHistory } = req.body;
  if (!message) return res.status(400).json({ error: 'message required' });

  // In local dev, return a mock response
  // In production, this would call Anthropic API
  const mockReply = generateMockReply(message, loanId);

  if (loanId) {
    await prisma.aIAnalysis.create({
      data: {
        loanId,
        triggeredBy: req.user!.id,
        analysisType: 'CHAT',
        modelId: 'claude-sonnet-4-20250514',
        inputSnapshot: { message, conversationHistory: conversationHistory || [] },
        outputRaw: mockReply,
        recommendation: undefined,
        reasoning: undefined,
      },
    });
  }

  return res.json({ reply: mockReply });
});

// POST /api/ai/analyze/:loanId
router.post('/analyze/:loanId', requireAuth, requireRole('UNDERWRITER', 'ADMIN'), async (req: Request, res: Response) => {
  const { loanId } = req.params;
  const { analysisType } = req.body;

  const loan = await prisma.loan.findUnique({ where: { id: loanId } });
  if (!loan) return res.status(404).json({ error: 'Loan not found' });

  const jobId = uuidv4();

  // In local dev, run synchronously with mock data
  const mockScores = { ltv: 72, dscr: 68, credit: 81, property: 77, borrower: 74, composite: 74 };
  const mockRecommendation = mockScores.composite >= 75 ? 'APPROVE' : 'MANUAL_REVIEW';

  await prisma.aIAnalysis.create({
    data: {
      id: jobId,
      loanId,
      triggeredBy: req.user!.id,
      analysisType: analysisType || 'UNDERWRITING',
      modelId: 'claude-sonnet-4-20250514',
      inputSnapshot: { loanId, analysisType },
      outputRaw: JSON.stringify({ scores: mockScores, recommendation: mockRecommendation }),
      scores: mockScores,
      recommendation: mockRecommendation,
      reasoning: 'LTV within acceptable range. DSCR slightly below threshold. Property valuation supports loan amount. Borrower profile is solid.',
      tokensUsed: 1250,
      latencyMs: 2300,
    },
  });

  if (analysisType === 'UNDERWRITING') {
    await prisma.loan.update({
      where: { id: loanId },
      data: { aiRiskScore: mockScores.composite, aiRecommendation: mockRecommendation },
    });
  }

  return res.json({ jobId, queued: true });
});

// GET /api/ai/analyses/:loanId
router.get('/analyses/:loanId', requireAuth, async (req: Request, res: Response) => {
  const { loanId } = req.params;
  const analyses = await prisma.aIAnalysis.findMany({
    where: { loanId },
    orderBy: { createdAt: 'desc' },
  });
  return res.json({ analyses });
});

function generateMockReply(message: string, loanId?: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('status') || lower.includes('where')) {
    return 'Based on my analysis, this loan is currently in the underwriting review phase. The AI completeness score is 78/100. Key missing items: current pay stubs and updated bank statements.';
  }
  if (lower.includes('dscr')) {
    return 'The DSCR (Debt Service Coverage Ratio) for this loan is 1.18, which is above the minimum threshold of 1.0 but below our preferred 1.25. This represents moderate cash flow coverage on the subject property.';
  }
  if (lower.includes('risk') || lower.includes('score')) {
    return 'The composite AI risk score is 74/100. Strongest factors: property valuation (77) and credit profile (81). Areas of concern: DSCR at 68. Overall recommendation: MANUAL_REVIEW with attention to income documentation.';
  }
  if (lower.includes('condition')) {
    return 'There are 3 open conditions on this loan: (1) Updated bank statements — 60 days required, (2) Employment verification letter, (3) Flood zone certification. All are assigned to the broker.';
  }
  return `Thank you for your question about "${message.substring(0, 50)}". Based on the loan file analysis, I recommend reviewing the borrower's financial documentation and property appraisal. Please let me know if you need specific details about any aspect of this loan.`;
}

export default router;
