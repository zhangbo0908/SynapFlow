import { render, screen, fireEvent } from "@testing-library/react";
import { OnboardingOverlay } from "../../../src/renderer/src/components/OnboardingOverlay";
import { describe, it, expect, vi } from "vitest";
import React from "react";

describe("OnboardingOverlay", () => {
  it("should not render when visible is false", () => {
    const { container } = render(
      <OnboardingOverlay visible={false} onComplete={() => {}} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("should render content when visible is true", () => {
    render(<OnboardingOverlay visible={true} onComplete={() => {}} />);
    expect(screen.getByText(/Welcome to SynapFlow/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Get Started/i }),
    ).toBeInTheDocument();
  });

  it('should call onComplete when "Get Started" is clicked', () => {
    const onComplete = vi.fn();
    render(<OnboardingOverlay visible={true} onComplete={onComplete} />);

    fireEvent.click(screen.getByRole("button", { name: /Get Started/i }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
