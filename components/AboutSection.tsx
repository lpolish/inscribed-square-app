import { useTranslations } from 'next-intl'
import 'katex/dist/katex.min.css'
import { BlockMath } from 'react-katex'
import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

type LanguageOption = 'javascript' | 'python' | 'typescript' | 'c' | 'java' | 'ruby' | 'go';

const AboutSection = () => {
  const t = useTranslations('about')
  const [inscribedLanguage, setInscribedLanguage] = useState<LanguageOption>('javascript')
  const [extendedLanguage, setExtendedLanguage] = useState<LanguageOption>('javascript')

  const isValidLanguage = (value: string): value is LanguageOption =>
    ['javascript', 'python', 'typescript', 'c', 'java', 'ruby', 'go'].includes(value);

  const inscribedCode: Record<LanguageOption, string> = {
    javascript: `function findInscribedSquare(curve) {
  const minX = Math.min(...curve.map(p => p.x));
  const maxX = Math.max(...curve.map(p => p.x));
  const minY = Math.min(...curve.map(p => p.y));
  const maxY = Math.max(...curve.map(p => p.y));

  let bestSquare = [];
  let maxSize = 0;

  for (let i = 0; i < 1000; i++) {
    const center = getRandomPointInside(curve);
    let low = 0;
    let high = Math.min(maxX - minX, maxY - minY);

    while (high - low > 1) {
      const mid = (low + high) / 2;
      const square = [
        { x: center.x - mid / 2, y: center.y - mid / 2 },
        { x: center.x + mid / 2, y: center.y - mid / 2 },
        { x: center.x + mid / 2, y: center.y + mid / 2 },
        { x: center.x - mid / 2, y: center.y + mid / 2 },
      ];

      if (square.every(p => isPointInside(p, curve))) {
        if (mid > maxSize) {
          maxSize = mid;
          bestSquare = square;
        }
        low = mid;
      } else {
        high = mid;
      }
    }
  }

  return bestSquare;
}`,
    python: `def find_inscribed_square(curve):
    min_x = min(p['x'] for p in curve)
    max_x = max(p['x'] for p in curve)
    min_y = min(p['y'] for p in curve)
    max_y = max(p['y'] for p in curve)

    best_square = []
    max_size = 0

    for _ in range(1000):
        center = get_random_point_inside(curve)
        low = 0
        high = min(max_x - min_x, max_y - min_y)

        while high - low > 1:
            mid = (low + high) / 2
            square = [
                {'x': center['x'] - mid / 2, 'y': center['y'] - mid / 2},
                {'x': center['x'] + mid / 2, 'y': center['y'] - mid / 2},
                {'x': center['x'] + mid / 2, 'y': center['y'] + mid / 2},
                {'x': center['x'] - mid / 2, 'y': center['y'] + mid / 2},
            ]

            if all(is_point_inside(p, curve) for p in square):
                if mid > max_size:
                    max_size = mid
                    best_square = square
                low = mid
            else:
                high = mid

    return best_square`,
    typescript: `function findInscribedSquare(curve: Point[]): Point[] {
  const minX = Math.min(...curve.map(p => p.x));
  const maxX = Math.max(...curve.map(p => p.x));
  const minY = Math.min(...curve.map(p => p.y));
  const maxY = Math.max(...curve.map(p => p.y));

  let bestSquare: Point[] = [];
  let maxSize = 0;

  for (let i = 0; i < 1000; i++) {
    const center = getRandomPointInside(curve);
    let low = 0;
    let high = Math.min(maxX - minX, maxY - minY);

    while (high - low > 1) {
      const mid = (low + high) / 2;
      const square: Point[] = [
        { x: center.x - mid / 2, y: center.y - mid / 2 },
        { x: center.x + mid / 2, y: center.y - mid / 2 },
        { x: center.x + mid / 2, y: center.y + mid / 2 },
        { x: center.x - mid / 2, y: center.y + mid / 2 },
      ];

      if (square.every(p => isPointInside(p, curve))) {
        if (mid > maxSize) {
          maxSize = mid;
          bestSquare = square;
        }
        low = mid;
      } else {
        high = mid;
      }
    }
  }

  return bestSquare;
}`,
    c: `#include <stdio.h>
#include <stdlib.h>
#include <math.h>

typedef struct {
    double x;
    double y;
} Point;

Point* find_inscribed_square(Point* curve, int curve_size) {
    double min_x = curve[0].x, max_x = curve[0].x;
    double min_y = curve[0].y, max_y = curve[0].y;
    for (int i = 1; i < curve_size; i++) {
        if (curve[i].x < min_x) min_x = curve[i].x;
        if (curve[i].x > max_x) max_x = curve[i].x;
        if (curve[i].y < min_y) min_y = curve[i].y;
        if (curve[i].y > max_y) max_y = curve[i].y;
    }

    Point* best_square = malloc(4 * sizeof(Point));
    double max_size = 0;

    for (int i = 0; i < 1000; i++) {
        Point center = get_random_point_inside(curve, curve_size);
        double low = 0;
        double high = fmin(max_x - min_x, max_y - min_y);

        while (high - low > 1) {
            double mid = (low + high) / 2;
            Point square[4] = {
                {center.x - mid / 2, center.y - mid / 2},
                {center.x + mid / 2, center.y - mid / 2},
                {center.x + mid / 2, center.y + mid / 2},
                {center.x - mid / 2, center.y + mid / 2}
            };

            if (is_square_inside(square, curve, curve_size)) {
                if (mid > max_size) {
                    max_size = mid;
                    for (int j = 0; j < 4; j++) {
                        best_square[j] = square[j];
                    }
                }
                low = mid;
            } else {
                high = mid;
            }
        }
    }

    return best_square;
}`,
    java: `import java.util.ArrayList;
import java.util.List;

public class InscribedSquareFinder {
    public static List<Point> findInscribedSquare(List<Point> curve) {
        double minX = curve.stream().mapToDouble(p -> p.x).min().orElse(0);
        double maxX = curve.stream().mapToDouble(p -> p.x).max().orElse(0);
        double minY = curve.stream().mapToDouble(p -> p.y).min().orElse(0);
        double maxY = curve.stream().mapToDouble(p -> p.y).max().orElse(0);

        List<Point> bestSquare = new ArrayList<>();
        double maxSize = 0;

        for (int i = 0; i < 1000; i++) {
            Point center = getRandomPointInside(curve);
            double low = 0;
            double high = Math.min(maxX - minX, maxY - minY);

            while (high - low > 1) {
                double mid = (low + high) / 2;
                List<Point> square = Arrays.asList(
                    new Point(center.x - mid / 2, center.y - mid / 2),
                    new Point(center.x + mid / 2, center.y - mid / 2),
                    new Point(center.x + mid / 2, center.y + mid / 2),
                    new Point(center.x - mid / 2, center.y + mid / 2)
                );

                if (square.stream().allMatch(p -> isPointInside(p, curve))) {
                    if (mid > maxSize) {
                        maxSize = mid;
                        bestSquare = new ArrayList<>(square);
                    }
                    low = mid;
                } else {
                    high = mid;
                }
            }
        }

        return bestSquare;
    }
}`,
    ruby: `def find_inscribed_square(curve)
  min_x, max_x = curve.map { |p| p[:x] }.minmax
  min_y, max_y = curve.map { |p| p[:y] }.minmax

  best_square = []
  max_size = 0

  1000.times do
    center = get_random_point_inside(curve)
    low = 0
    high = [max_x - min_x, max_y - min_y].min

    while high - low > 1
      mid = (low + high) / 2
      square = [
        { x: center[:x] - mid / 2, y: center[:y] - mid / 2 },
        { x: center[:x] + mid / 2, y: center[:y] - mid / 2 },
        { x: center[:x] + mid / 2, y: center[:y] + mid / 2 },
        { x: center[:x] - mid / 2, y: center[:y] + mid / 2 }
      ]

      if square.all? { |p| is_point_inside?(p, curve) }
        if mid > max_size
          max_size = mid
          best_square = square
        end
        low = mid
      else
        high = mid
      end
    end
  end

  best_square
end`,
    go: `package main

import (
	"math"
	"math/rand"
)

type Point struct {
	x, y float64
}

func findInscribedSquare(curve []Point) []Point {
	minX, maxX := curve[0].x, curve[0].x
	minY, maxY := curve[0].y, curve[0].y
	for _, p := range curve {
		minX = math.Min(minX, p.x)
		maxX = math.Max(maxX, p.x)
		minY = math.Min(minY, p.y)
		maxY = math.Max(maxY, p.y)
	}

	bestSquare := make([]Point, 4)
	maxSize := 0.0

	for i := 0; i < 1000; i++ {
		center := getRandomPointInside(curve)
		low := 0.0
		high := math.Min(maxX-minX, maxY-minY)

		for high-low > 1 {
			mid := (low + high) / 2
			square := []Point{
				{center.x - mid/2, center.y - mid/2},
				{center.x + mid/2, center.y - mid/2},
				{center.x + mid/2, center.y + mid/2},
				{center.x - mid/2, center.y + mid/2},
			}

			if allPointsInside(square, curve) {
				if mid > maxSize {
					maxSize = mid
					copy(bestSquare, square)
				}
				low = mid
			} else {
				high = mid
			}
		}
	}

	return bestSquare
}`
  }

  const extendedCode: Record<LanguageOption, string> = {
    javascript: `function findExtendedSquare(curve) {
  const minX = Math.min(...curve.map(p => p.x));
  const maxX = Math.max(...curve.map(p => p.x));
  const minY = Math.min(...curve.map(p => p.y));
  const maxY = Math.max(...curve.map(p => p.y));

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const size = Math.max(maxX - minX, maxY - minY);

  return [
    { x: centerX - size / 2, y: centerY - size / 2 },
    { x: centerX + size / 2, y: centerY - size / 2 },
    { x: centerX + size / 2, y: centerY + size / 2 },
    { x: centerX - size / 2, y: centerY + size / 2 },
  ];
}`,
    python: `def find_extended_square(curve):
    min_x = min(p['x'] for p in curve)
    max_x = max(p['x'] for p in curve)
    min_y = min(p['y'] for p in curve)
    max_y = max(p['y'] for p in curve)

    center_x = (min_x + max_x) / 2
    center_y = (min_y + max_y) / 2
    size = max(max_x - min_x, max_y - min_y)

    return [
        {'x': center_x - size / 2, 'y': center_y - size / 2},
        {'x': center_x + size / 2, 'y': center_y - size / 2},
        {'x': center_x + size / 2, 'y': center_y + size / 2},
        {'x': center_x - size / 2, 'y': center_y + size / 2},
    ]`,
    typescript: `function findExtendedSquare(curve: Point[]): Point[] {
  const minX = Math.min(...curve.map(p => p.x));
  const maxX = Math.max(...curve.map(p=> p.x));
  const minY = Math.min(...curve.map(p => p.y));
  const maxY = Math.max(...curve.map(p => p.y));

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const size = Math.max(maxX - minX, maxY - minY);

  return [
    { x: centerX - size / 2, y: centerY - size / 2 },
    { x: centerX + size / 2, y: centerY - size / 2 },
    { x: centerX + size / 2, y: centerY + size / 2 },
    { x: centerX - size / 2, y: centerY + size / 2 },
  ];
}`,
    c: `#include <stdio.h>
#include <stdlib.h>
#include <math.h>

typedef struct {
    double x;
    double y;
} Point;

Point* find_extended_square(Point* curve, int curve_size) {
    double min_x = curve[0].x, max_x = curve[0].x;
    double min_y = curve[0].y, max_y = curve[0].y;
    for (int i = 1; i < curve_size; i++) {
        if (curve[i].x < min_x) min_x = curve[i].x;
        if (curve[i].x > max_x) max_x = curve[i].x;
        if (curve[i].y < min_y) min_y = curve[i].y;
        if (curve[i].y > max_y) max_y = curve[i].y;
    }

    double center_x = (min_x + max_x) / 2;
    double center_y = (min_y + max_y) / 2;
    double size = fmax(max_x - min_x, max_y - min_y);

    Point* square = malloc(4 * sizeof(Point));
    square[0] = (Point){center_x - size / 2, center_y - size / 2};
    square[1] = (Point){center_x + size / 2, center_y - size / 2};
    square[2] = (Point){center_x + size / 2, center_y + size / 2};
    square[3] = (Point){center_x - size / 2, center_y + size / 2};

    return square;
}`,
    java: `import java.util.ArrayList;
import java.util.List;

public class ExtendedSquareFinder {
    public static List<Point> findExtendedSquare(List<Point> curve) {
        double minX = curve.stream().mapToDouble(p -> p.x).min().orElse(0);
        double maxX = curve.stream().mapToDouble(p -> p.x).max().orElse(0);
        double minY = curve.stream().mapToDouble(p -> p.y).min().orElse(0);
        double maxY = curve.stream().mapToDouble(p -> p.y).max().orElse(0);

        double centerX = (minX + maxX) / 2;
        double centerY = (minY + maxY) / 2;
        double size = Math.max(maxX - minX, maxY - minY);

        return Arrays.asList(
            new Point(centerX - size / 2, centerY - size / 2),
            new Point(centerX + size / 2, centerY - size / 2),
            new Point(centerX + size / 2, centerY + size / 2),
            new Point(centerX - size / 2, centerY + size / 2)
        );
    }
}`,
    ruby: `def find_extended_square(curve)
  min_x, max_x = curve.map { |p| p[:x] }.minmax
  min_y, max_y = curve.map { |p| p[:y] }.minmax

  center_x = (min_x + max_x) / 2
  center_y = (min_y + max_y) / 2
  size = [max_x - min_x, max_y - min_y].max

  [
    { x: center_x - size / 2, y: center_y - size / 2 },
    { x: center_x + size / 2, y: center_y - size / 2 },
    { x: center_x + size / 2, y: center_y + size / 2 },
    { x: center_x - size / 2, y: center_y + size / 2 }
  ]
end`,
    go: `package main

import (
	"math"
)

type Point struct {
	x, y float64
}

func findExtendedSquare(curve []Point) []Point {
	minX, maxX := curve[0].x, curve[0].x
	minY, maxY := curve[0].y, curve[0].y
	for _, p := range curve {
		minX = math.Min(minX, p.x)
		maxX = math.Max(maxX, p.x)
		minY = math.Min(minY, p.y)
		maxY = math.Max(maxY, p.y)
	}

	centerX := (minX + maxX) / 2
	centerY := (minY + maxY) / 2
	size := math.Max(maxX-minX, maxY-minY)

	return []Point{
		{centerX - size/2, centerY - size/2},
		{centerX + size/2, centerY - size/2},
		{centerX + size/2, centerY + size/2},
		{centerX - size/2, centerY + size/2},
	}
}`
  }

  return (
    <div className="mt-32 space-y-48 font-noto">
      <section className="space-y-24">
        <h2 className="text-6xl md:text-8xl font-bold tracking-tight leading-tight pb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#0070F3] to-[#00A6ED]">
          {t('title')}
        </h2>
      </section>

      <section className="space-y-24">
        <h2 className="text-5xl md:text-7xl font-bold leading-tight pb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#0070F3] to-[#00A6ED]">
          {t('mathFoundations.title')}
        </h2>
        <div className="space-y-16">
          <div className="p-12 rounded-2xl bg-white/50 dark:bg-[#000212]/50 border border-neutral-200/10 backdrop-blur-sm">
            <h3 className="text-4xl font-medium leading-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[#0070F3]/90 to-[#00A6ED]/90">
              {t('mathFoundations.shoelace.title')}
            </h3>
            <p className="text-2xl mb-8 text-neutral-800 dark:text-neutral-200">
              {t('mathFoundations.shoelace.description')}
            </p>
            <div className="text-xs md:text-lg font-mono p-8 rounded-xl bg-[#0070F3]/5 dark:bg-[#0070F3]/10 border border-[#0070F3]/20">
              <BlockMath math="A = \frac{1}{2}\left|\sum_{i=1}^{n-1} (x_i y_{i+1} + x_n y_1) - \sum_{i=1}^{n-1} (x_{i+1} y_i + x_1 y_n)\right|" />
            </div>
            <p className="text-xl mt-6 text-neutral-600 dark:text-neutral-400">
              {t('mathFoundations.shoelace.explanation')}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-24">
        <h2 className="text-5xl md:text-7xl font-bold leading-tight pb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#0070F3] to-[#00A6ED]">
          {t('mathFoundations.algorithm.title')}
        </h2>
        <div className="space-y-16">
          <div className="p-12 rounded-2xl bg-white/50 dark:bg-[#000212]/50 border border-neutral-200/10 backdrop-blur-sm">
            <h3 className="text-4xl font-medium leading-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[#0070F3]/90 to-[#00A6ED]/90">
              {t('mathFoundations.algorithm.inscribedSquare')}
            </h3>
            <p className="text-2xl mb-8 text-neutral-800 dark:text-neutral-200">
              {t('mathFoundations.algorithm.inscribedExplanation')}
            </p>
            <Tabs value={inscribedLanguage} onValueChange={(value: string) => {
              if (isValidLanguage(value)) {
                setInscribedLanguage(value);
              }
            }}>
              <TabsList>
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="typescript">TypeScript</TabsTrigger>
                <TabsTrigger value="c">C</TabsTrigger>
                <TabsTrigger value="java">Java</TabsTrigger>
                <TabsTrigger value="ruby">Ruby</TabsTrigger>
                <TabsTrigger value="go">Go</TabsTrigger>
              </TabsList>
              <TabsContent value={inscribedLanguage}>
                <SyntaxHighlighter language={inscribedLanguage} style={vscDarkPlus}>
                  {inscribedCode[inscribedLanguage]}
                </SyntaxHighlighter>
              </TabsContent>
            </Tabs>
            <p className="text-xl mt-6 text-neutral-600 dark:text-neutral-400">
              {t('mathFoundations.algorithm.inscribedExplanation')}
            </p>
          </div>

          <div className="p-12 rounded-2xl bg-white/50 dark:bg-[#000212]/50 border border-neutral-200/10 backdrop-blur-sm">
            <h3 className="text-4xl font-medium leading-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[#0070F3]/90 to-[#00A6ED]/90">
              {t('mathFoundations.algorithm.extendedSquare')}
            </h3>
            <p className="text-2xl mb-8 text-neutral-800 dark:text-neutral-200">
              {t('mathFoundations.algorithm.extendedExplanation')}
            </p>
            <Tabs value={extendedLanguage} onValueChange={(value: string) => {
              if (isValidLanguage(value)) {
                setExtendedLanguage(value);
              }
            }}>
              <TabsList>
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="typescript">TypeScript</TabsTrigger>
                <TabsTrigger value="c">C</TabsTrigger>
                <TabsTrigger value="java">Java</TabsTrigger>
                <TabsTrigger value="ruby">Ruby</TabsTrigger>
                <TabsTrigger value="go">Go</TabsTrigger>
              </TabsList>
              <TabsContent value={extendedLanguage}>
                <SyntaxHighlighter language={extendedLanguage} style={vscDarkPlus}>
                  {extendedCode[extendedLanguage]}
                </SyntaxHighlighter>
              </TabsContent>
            </Tabs>
            <p className="text-xl mt-6 text-neutral-600 dark:text-neutral-400">
              {t('mathFoundations.algorithm.extendedExplanation')}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-24">
        <h2 className="text-5xl md:text-7xl font-bold leading-tight pb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#0070F3] to-[#00A6ED]">
          {t('introduction.title')}
        </h2>
        <div className="space-y-16">
          <div className="space-y-8 text-3xl leading-relaxed text-neutral-800 dark:text-neutral-200">
            <p>{t('introduction.paragraph1')}</p>
            <p>{t('introduction.paragraph2')}</p>
          </div>
        </div>
      </section>

      <section className="space-y-24">
        <h2 className="text-5xl md:text-7xl font-bold leading-tight pb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#0070F3] to-[#00A6ED]">
          {t('keyConcepts.title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {['closedCurves', 'inscribedSquares', 'extendedSquares', 'areaCalculation', 'curveLength'].map((concept) => (
            <div
              key={concept}
              className="p-12 rounded-2xl bg-white/50 dark:bg-[#000212]/50 border border-neutral-200/10 
                        backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg
                        dark:hover:bg-[#000212]/80"
            >
              <h3 className="text-4xl font-medium leading-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[#0070F3]/90 to-[#00A6ED]/90">
                {t(`keyConcepts.${concept}.title`)}
              </h3>
              <p className="text-2xl leading-relaxed text-neutral-800 dark:text-neutral-200">
                {t(`keyConcepts.${concept}.description`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-16">
        <h2 className="text-5xl md:text-7xl font-bold leading-tight pb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#0070F3] to-[#00A6ED]">
          {t('howToUse.title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {['step1', 'step2', 'step3', 'step4', 'step5', 'step6', 'step7'].map((step, index) => (
            <div
              key={step}
              className="p-8 rounded-xl bg-white/50 dark:bg-[#000212]/50 border border-neutral-200/10 
                        backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex items-start gap-4">
                <span className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#0070F3]/70 to-[#00A6ED]/70">
                  {index + 1}
                </span>
                <p className="text-2xl leading-relaxed text-neutral-800 dark:text-neutral-200">
                  {t(`howToUse.steps.${step}`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-16">
        <h2 className="text-5xl md:text-7xl font-bold leading-tight pb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#0070F3] to-[#00A6ED]">
          {t('furtherExploration.title')}
        </h2>
        <p className="text-3xl text-neutral-800 dark:text-neutral-200">{t('furtherExploration.description')}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {['circles', 'algorithms', 'relationships', '3d'].map((topic) => (
            <div
              key={topic}
              className="p-8 rounded-xl bg-white/50 dark:bg-[#000212]/50 border border-neutral-200/10 
                        backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]
                        hover:shadow-[0_0_15px_rgba(0,112,243,0.1)]"
            >
              <p className="text-xl leading-relaxed text-neutral-800 dark:text-neutral-200">
                {t(`furtherExploration.topics.${topic}`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <p className="text-4xl font-bold italic leading-relaxed bg-clip-text text-transparent bg-gradient-to-r from-[#0070F3] to-[#00A6ED]">
        {t('conclusion')}
      </p>
    </div>
  )
}

export default AboutSection

