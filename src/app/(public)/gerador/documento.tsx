import { Page, Text, View, Document, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { htmlToText } from 'html-to-text';

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  section: {
    marginBottom: 10,
    padding: 10,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  text: {
    fontSize: 12,
    marginBottom: 10,
  },
});

// Convert HTML to text
const convertHtmlToText = (html: string) => {
  return htmlToText(html, {
    wordwrap: 130, // Control line wrapping
    selectors: [
      { selector: 'h1', format: 'heading', options: { uppercase: false, baseFontSize: 24 } },
      { selector: 'h2', format: 'heading', options: { uppercase: false, baseFontSize: 20 } },
      { selector: 'h3', format: 'heading', options: { uppercase: false, baseFontSize: 16 } },
    ],
  });
};

const MyDocument = ({ content }: { content: string }) => {
  const textContent = convertHtmlToText(content);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.text}>{textContent}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default MyDocument;
