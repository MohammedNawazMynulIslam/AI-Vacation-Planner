// app/components/ItineraryPDF.tsx
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";

// ── Register fonts (optional but makes it premium) ──
Font.register({
  family: "Geist",
  src: "/fonts/Geist-Regular.ttf",
});

interface PDFActivity {
  time: string;
  task: string;
  description: string;
  placeVerified?: boolean;
}

interface PDFDayPlan {
  day: number;
  title: string;
  image?: string;
  hotel?: { name: string; starRating: string };
  activities: PDFActivity[];
  travelTips?: string[];
}

interface PDFPlan {
  destination: string;
  days: number;
  description: string;
  highlights: { title: string; rating: string }[];
  gastronomy: string;
  smartTravel: string;
  budget: { min: number; max: number };
  itinerary: PDFDayPlan[];
  image?: string;
  weather?: {
    summary: string;
    forecast: { date: string; temp: number; condition: string }[];
  };
}

const COLORS = {
  emerald: "#10b981",
  indigo: "#6366f1",
  slate: "#1e293b",
  white: "#ffffff",
  gray: "#64748b",
  lightGray: "#94a3b8",
  darkBg: "#0f172a",
  cardBg: "#1e293b",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.darkBg,
    padding: 40,
    fontFamily: "Helvetica",
  },
  coverPage: {
    backgroundColor: COLORS.darkBg,
    padding: 0,
    position: "relative",
  },
  coverImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    opacity: 0.3,
  },
  coverOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(15, 23, 42, 0.85)",
  },
  coverContent: {
    position: "absolute",
    bottom: 80,
    left: 50,
    right: 50,
  },
  coverLabel: {
    fontSize: 10,
    color: COLORS.emerald,
    textTransform: "uppercase",
    letterSpacing: 3,
    marginBottom: 16,
    fontWeight: "bold",
  },
  coverTitle: {
    fontSize: 48,
    color: COLORS.white,
    fontWeight: "black",
    marginBottom: 16,
    letterSpacing: -1,
  },
  coverSubtitle: {
    fontSize: 14,
    color: COLORS.lightGray,
    lineHeight: 1.6,
    maxWidth: 400,
  },
  coverMeta: {
    position: "absolute",
    bottom: 40,
    left: 50,
    flexDirection: "row",
    gap: 24,
  },
  coverMetaItem: {
    fontSize: 10,
    color: COLORS.gray,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 8,
  },
  sectionLine: {
    width: 30,
    height: 2,
    backgroundColor: COLORS.emerald,
    marginRight: 12,
  },
  sectionLabel: {
    fontSize: 10,
    color: COLORS.emerald,
    textTransform: "uppercase",
    letterSpacing: 3,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 28,
    color: COLORS.white,
    fontWeight: "black",
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  highlightGrid: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 32,
  },
  highlightCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.emerald,
  },
  highlightTitle: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: "bold",
    marginBottom: 6,
  },
  highlightRating: {
    fontSize: 10,
    color: COLORS.emerald,
    fontWeight: "bold",
  },
  infoCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 10,
    color: COLORS.gray,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 8,
    fontWeight: "bold",
  },
  infoText: {
    fontSize: 12,
    color: COLORS.lightGray,
    lineHeight: 1.6,
  },
  budgetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 24,
    marginBottom: 32,
  },
  budgetAmount: {
    fontSize: 32,
    color: COLORS.white,
    fontWeight: "black",
    letterSpacing: -1,
  },
  budgetLabel: {
    fontSize: 10,
    color: COLORS.gray,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  dayPage: {
    backgroundColor: COLORS.darkBg,
    padding: 40,
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dayNumber: {
    fontSize: 48,
    color: COLORS.emerald,
    fontWeight: "black",
    marginRight: 16,
    opacity: 0.3,
  },
  dayTitle: {
    fontSize: 24,
    color: COLORS.white,
    fontWeight: "bold",
    flex: 1,
  },
  dayImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 24,
    objectFit: "cover",
  },
  hotelBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderRadius: 8,
    padding: "8 16",
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  hotelText: {
    fontSize: 11,
    color: COLORS.emerald,
    fontWeight: "bold",
  },
  timeline: {
    marginLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: "rgba(255,255,255,0.1)",
    paddingLeft: 20,
  },
  timelineItem: {
    marginBottom: 20,
    position: "relative",
  },
  timelineDot: {
    position: "absolute",
    left: -26,
    top: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.emerald,
  },
  timelineTime: {
    fontSize: 9,
    color: COLORS.gray,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 4,
  },
  timelineTask: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: "bold",
    marginBottom: 4,
  },
  timelineDesc: {
    fontSize: 11,
    color: COLORS.lightGray,
    lineHeight: 1.5,
  },
  tipsBox: {
    backgroundColor: "rgba(16, 185, 129, 0.05)",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.emerald,
  },
  tipsTitle: {
    fontSize: 10,
    color: COLORS.emerald,
    textTransform: "uppercase",
    letterSpacing: 2,
    fontWeight: "bold",
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 11,
    color: COLORS.lightGray,
    lineHeight: 1.6,
  },
  weatherBar: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  weatherItem: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    minWidth: 70,
  },
  weatherTemp: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: "bold",
  },
  weatherDate: {
    fontSize: 8,
    color: COLORS.gray,
    textTransform: "uppercase",
    marginTop: 4,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    paddingTop: 12,
  },
  footerText: {
    fontSize: 8,
    color: COLORS.gray,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  pageNumber: {
    fontSize: 10,
    color: COLORS.gray,
  },
});

// ── Cover Page ──
function CoverPage({ plan }: { plan: PDFPlan }) {
  return (
    <Page size="A4" style={styles.coverPage}>
      {plan.image && <Image src={plan.image} style={styles.coverImage} />}
      <View style={styles.coverOverlay} />
      <View style={styles.coverContent}>
        <Text style={styles.coverLabel}>AI-Generated Itinerary</Text>
        <Text style={styles.coverTitle}>
          {plan.destination}
        </Text>
        <Text style={styles.coverSubtitle}>{plan.description}</Text>
      </View>
      <View style={styles.coverMeta}>
        <Text style={styles.coverMetaItem}>{plan.days} Days</Text>
        <Text style={styles.coverMetaItem}>
          ${plan.budget.min} - ${plan.budget.max} USD
        </Text>
        <Text style={styles.coverMetaItem}>
          Generated by Aetheria
        </Text>
      </View>
    </Page>
  );
}

// ── Overview Page ──
function OverviewPage({ plan }: { plan: PDFPlan }) {
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionLine} />
        <Text style={styles.sectionLabel}>Trip Overview</Text>
      </View>
      <Text style={styles.sectionTitle}>Essential Intelligence</Text>

      {/* Highlights */}
      <View style={styles.highlightGrid}>
        {plan.highlights.map((h, i) => (
          <View key={i} style={[styles.highlightCard, { borderLeftColor: i === 1 ? COLORS.indigo : i === 2 ? "#f59e0b" : COLORS.emerald }]}>
            <Text style={styles.highlightTitle}>{h.title}</Text>
            <Text style={styles.highlightRating}>{h.rating}</Text>
          </View>
        ))}
      </View>

      {/* Budget */}
      <View style={styles.budgetRow}>
        <View>
          <Text style={styles.budgetAmount}>
            ${plan.budget.min} - ${plan.budget.max}
          </Text>
          <Text style={styles.budgetLabel}>Estimated per person</Text>
        </View>
      </View>

      {/* Gastronomy & Tips */}
      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Gastronomy</Text>
        <Text style={styles.infoText}>{plan.gastronomy}</Text>
      </View>
      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Smart Travel Tips</Text>
        <Text style={styles.infoText}>{plan.smartTravel}</Text>
      </View>

      {/* Weather */}
      {plan.weather && (
        <View>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLine} />
            <Text style={styles.sectionLabel}>Forecast</Text>
          </View>
          <Text style={{ fontSize: 12, color: COLORS.lightGray, marginBottom: 12 }}>
            {plan.weather.summary}
          </Text>
          <View style={styles.weatherBar}>
            {plan.weather.forecast.slice(0, 5).map((w, i) => (
              <View key={i} style={styles.weatherItem}>
                <Text style={styles.weatherTemp}>{w.temp}°</Text>
                <Text style={styles.weatherDate}>
                  {new Date(w.date).toLocaleDateString("en-US", { weekday: "short" })}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>Aetheria AI Travel Planner</Text>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </View>
    </Page>
  );
}

// ── Day Page ──
function DayPage({ day, dayIndex, totalDays }: { day: PDFDayPlan; dayIndex: number; totalDays: number }) {
  return (
    <Page size="A4" style={styles.dayPage}>
      <View style={styles.dayHeader}>
        <Text style={styles.dayNumber}>{String(day.day).padStart(2, "0")}</Text>
        <Text style={styles.dayTitle}>{day.title}</Text>
      </View>

      {day.image && <Image src={day.image} style={styles.dayImage} />}

      {day.hotel && (
        <View style={styles.hotelBadge}>
          <Text style={styles.hotelText}>
           {day.hotel.name} · {day.hotel.starRating}
          </Text>
        </View>
      )}

      <View style={styles.timeline}>
        {day.activities.map((activity, i) => (
          <View key={i} style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <Text style={styles.timelineTime}>{activity.time}</Text>
            <Text style={styles.timelineTask}>{activity.task}</Text>
            <Text style={styles.timelineDesc}>{activity.description}</Text>
          </View>
        ))}
      </View>

      {day.travelTips && day.travelTips.length > 0 && (
        <View style={styles.tipsBox}>
          <Text style={styles.tipsTitle}>Contextual Advice</Text>
          {day.travelTips.map((tip, i) => (
            <Text key={i} style={styles.tipsText}>• {tip}</Text>
          ))}
        </View>
      )}

      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>Day {day.day} of {totalDays} · {day.title}</Text>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </View>
    </Page>
  );
}

// ── Main Document ──
export default function ItineraryPDF({ plan }: { plan: PDFPlan }) {
  return (
    <Document
      title={`${plan.destination} Itinerary - Aetheria`}
      author="Aetheria AI"
      subject={`${plan.days}-day travel plan for ${plan.destination}`}
    >
      <CoverPage plan={plan} />
      <OverviewPage plan={plan} />
      {plan.itinerary.map((day) => (
        <DayPage
          key={day.day}
          day={day}
          dayIndex={day.day}
          totalDays={plan.days}
        />
      ))}
    </Document>
  );
}