import logging
from typing import List, Dict, Optional
from datetime import datetime
import os
import csv

logger = logging.getLogger(__name__)


class GoogleSheetsService:
    def __init__(self, credentials_path: str, spreadsheet_id: str):
        self.credentials_path = credentials_path
        self.spreadsheet_id = spreadsheet_id
        self._client = None
        self._has_credentials = os.path.exists(credentials_path)

    def _get_client(self):
        if not self._has_credentials:
            logger.warning("No Google credentials file found")
            return None

        if self._client is None:
            try:
                from google.auth.transport.requests import Request
                from google.oauth2.credentials import Credentials
                from googleapiclient.discovery import build

                credentials = Credentials.from_authorized_user_file(
                    self.credentials_path,
                    ["https://www.googleapis.com/auth/spreadsheets"],
                )

                if not credentials or not credentials.valid:
                    if (
                        credentials
                        and credentials.expired
                        and credentials.refresh_token
                    ):
                        credentials.refresh(Request())
                    else:
                        return None

                self._client = build("sheets", "v4", credentials=credentials)
            except Exception as e:
                logger.error(f"Failed to initialize Google Sheets: {e}")
                return None
        return self._client

    def _get_data_dir(self) -> str:
        """Get the data directory path"""
        # Hardcoded path to lead_gen_automation/data
        return "/Users/divyansh/Documents/GitHub/automation/lead_gen_automation/data"

    def export_to_csv(self, leads: List[Dict], filename: str = None) -> str:
        """Fallback: Export leads to CSV file"""
        if filename is None:
            filename = f"leads_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"

        data_dir = self._get_data_dir()
        os.makedirs(data_dir, exist_ok=True)
        filepath = os.path.join(data_dir, filename)

        with open(filepath, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(
                [
                    "Business Name",
                    "Email",
                    "Contact Person",
                    "Status",
                    "Date Replied",
                    "Reply Content",
                ]
            )

            for lead in leads:
                writer.writerow(
                    [
                        lead.get("business_name", ""),
                        lead.get("email", ""),
                        lead.get("contact_person", ""),
                        lead.get("status", ""),
                        lead.get("date_replied", ""),
                        (lead.get("reply_content", "") or "")[:200],
                    ]
                )

        logger.info(f"Exported {len(leads)} leads to {filepath}")
        return filepath

    def update_leads_sheet(self, leads: List[Dict]) -> bool:
        client = self._get_client()

        # If no Google credentials, fallback to CSV export
        if not client:
            logger.info("Using CSV export fallback (no Google credentials)")
            filepath = self.export_to_csv(leads)
            return filepath is not None

        try:
            headers = [
                [
                    "Lead Generation Report - "
                    + datetime.now().strftime("%Y-%m-%d %H:%M")
                ]
            ]

            summary_data = [
                ["Summary"],
                ["Total Leads", str(len(leads))],
                ["Generated On", datetime.now().strftime("%Y-%m-%d %H:%M:%S")],
                [""],
            ]

            status_counts = {}
            for lead in leads:
                status = lead.get("status", "unknown")
                status_counts[status] = status_counts.get(status, 0) + 1

            for status, count in status_counts.items():
                summary_data.append([f"Status: {status}", str(count)])

            summary_data.append([""])
            summary_data.append(["Lead Details"])
            summary_data.append(
                [
                    "Business Name",
                    "Email",
                    "Contact",
                    "Status",
                    "Date Replied",
                    "Reply Content",
                ]
            )

            for lead in leads:
                summary_data.append(
                    [
                        lead.get("business_name", ""),
                        lead.get("email", ""),
                        lead.get("contact_person", ""),
                        lead.get("status", ""),
                        lead.get("date_replied", ""),
                        (lead.get("reply_content", "") or "")[:100],
                    ]
                )

            body = {"values": summary_data}
            result = (
                client.spreadsheets()
                .values()
                .append(
                    spreadsheetId=self.spreadsheet_id,
                    range="Sheet1!A1",
                    valueInputOption="USER_ENTERED",
                    body=body,
                )
                .execute()
            )

            logger.info(f"Updated Google Sheets with {len(leads)} leads")
            return True
        except Exception as e:
            logger.error(f"Failed to update Google Sheets: {e}")
            # Fallback to CSV
            return self.export_to_csv(leads) is not None

    def create_daily_report(self, stats: Dict) -> bool:
        client = self._get_client()

        if not client:
            # Save to CSV as fallback
            data_dir = self._get_data_dir()
            os.makedirs(data_dir, exist_ok=True)
            filepath = os.path.join(
                data_dir, f"daily_report_{datetime.now().strftime('%Y%m%d')}.csv"
            )

            with open(filepath, "w", newline="", encoding="utf-8") as f:
                writer = csv.writer(f)
                writer.writerow(["Daily Lead Generation Report"])
                writer.writerow(["Date", datetime.now().strftime("%Y-%m-%d")])
                writer.writerow(
                    ["Total Leads Generated", str(stats.get("total_leads", 0))]
                )
                writer.writerow(["Validated Leads", str(stats.get("validated", 0))])
                writer.writerow(["Emails Sent", str(stats.get("sent", 0))])
                writer.writerow(["Replies Received", str(stats.get("replied", 0))])
                writer.writerow(
                    ["Conversion Rate", str(stats.get("conversion_rate", 0)) + "%"]
                )

            logger.info(f"Daily report saved to {filepath}")
            return True

        try:
            report_data = [
                ["Daily Lead Generation Report"],
                ["Date", datetime.now().strftime("%Y-%m-%d")],
                ["Generated At", datetime.now().strftime("%H:%M:%S")],
                [""],
                ["Statistics"],
                ["Total Leads Generated", str(stats.get("total_leads", 0))],
                ["Validated Leads", str(stats.get("validated", 0))],
                ["Emails Sent", str(stats.get("sent", 0))],
                ["Replies Received", str(stats.get("replied", 0))],
                ["Conversion Rate", str(stats.get("conversion_rate", 0)) + "%"],
            ]

            body = {"values": report_data}
            result = (
                client.spreadsheets()
                .values()
                .append(
                    spreadsheetId=self.spreadsheet_id,
                    range="Reports!A1",
                    valueInputOption="USER_ENTERED",
                    body=body,
                )
                .execute()
            )

            return True
        except Exception as e:
            logger.error(f"Failed to create daily report: {e}")
            return False

        try:
            # Prepare headers
            headers = [
                [
                    "Lead Generation Report - "
                    + datetime.now().strftime("%Y-%m-%d %H:%M")
                ]
            ]

            # Add summary section
            summary_data = [
                ["Summary"],
                ["Total Leads", str(len(leads))],
                ["Generated On", datetime.now().strftime("%Y-%m-%d %H:%M:%S")],
                [""],
            ]

            # Count by status
            status_counts = {}
            for lead in leads:
                status = lead.get("status", "unknown")
                status_counts[status] = status_counts.get(status, 0) + 1

            for status, count in status_counts.items():
                summary_data.append([f"Status: {status}", str(count)])

            summary_data.append([""])
            summary_data.append(["Lead Details"])
            summary_data.append(
                [
                    "Business Name",
                    "Email",
                    "Contact",
                    "Status",
                    "Date Replied",
                    "Reply Content",
                ]
            )

            # Add lead rows
            for lead in leads:
                summary_data.append(
                    [
                        lead.get("business_name", ""),
                        lead.get("email", ""),
                        lead.get("contact_person", ""),
                        lead.get("status", ""),
                        lead.get("date_replied", ""),
                        (lead.get("reply_content", "") or "")[:100],
                    ]
                )

            # Append to sheet
            body = {"values": summary_data}
            result = (
                client.spreadsheets()
                .values()
                .append(
                    spreadsheetId=self.spreadsheet_id,
                    range="Sheet1!A1",
                    valueInputOption="USER_ENTERED",
                    body=body,
                )
                .execute()
            )

            logger.info(f"Updated Google Sheets with {len(leads)} leads")
            return True
        except Exception as e:
            logger.error(f"Failed to update Google Sheets: {e}")
            return False

    def create_daily_report(self, stats: Dict) -> bool:
        client = self._get_client()
        if not client:
            return False

        try:
            report_data = [
                ["Daily Lead Generation Report"],
                ["Date", datetime.now().strftime("%Y-%m-%d")],
                ["Generated At", datetime.now().strftime("%H:%M:%S")],
                [""],
                ["Statistics"],
                ["Total Leads Generated", str(stats.get("total_leads", 0))],
                ["Validated Leads", str(stats.get("validated", 0))],
                ["Emails Sent", str(stats.get("sent", 0))],
                ["Replies Received", str(stats.get("replied", 0))],
                ["Conversion Rate", str(stats.get("conversion_rate", 0)) + "%"],
            ]

            body = {"values": report_data}
            result = (
                client.spreadsheets()
                .values()
                .append(
                    spreadsheetId=self.spreadsheet_id,
                    range="Reports!A1",
                    valueInputOption="USER_ENTERED",
                    body=body,
                )
                .execute()
            )

            return True
        except Exception as e:
            logger.error(f"Failed to create daily report: {e}")
            return False
